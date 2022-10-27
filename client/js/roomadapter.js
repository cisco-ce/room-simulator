/**
 * Adapter that ties together the internal models of the sim (light, shades, ...)
 * with the (logical) UI extension events and commands:
 * - Models register to the ui events they are interested in, and is notified
 * - Models set ui extension states (widget values) whenever they change in the sim
 * - Also, makes sure all calls over xapi are throttled.
 */
import Light from './model/light';
import Curtain from './model/curtain';
import Projector from './model/projector';
import ClimateController from './model/climatecontroller';
import SourceList from './model/sources';
import Outside from './model/outside';
import Throttler from './utils/throttler';

const DefaultThrottling = 100;

export default class RoomAdapter {
  constructor(codec, view) {
    this.eventCallbacks = new Map();
    this.view = view;
    this.codec = codec;
    this.throttler = new Throttler(
      this.sendThrottled.bind(this),
      DefaultThrottling,
    );
    codec.setListener(this.onEvent.bind(this));
    this.setupLight();
    this.setupBlinds();
    this.setupProjector();
    this.setupHvac();
    this.setupSources();
    this.setupDrone();
    this.setupReset();
    this.setupStandby();
    this.setupOutside();
    this.setupSpeakerTrackDiagnostics();
  }

  getThrottler() {
    return this.throttler;
  }

  addCodecListener(widgetId, type, callback) {
    const key = this.key(widgetId, type);
    this.eventCallbacks.set(key, callback);
  }

  setupDrone() {
    this.addCodecListener('coke', 'clicked', () => {
      this.view.deliverCoke();
    });
  }

  setupSources() {
    this.sourceList = new SourceList(this.codec);
    this.view.setSourceModel(this.sourceList);
  }

  async initSources() {
    const adapter = this.codec;
    if (!adapter) return;

    adapter.removeAllExternalSources();

    const sources = this.sourceList.getSources();
    for (const [id, source] of sources) {
      await adapter.addExternalSource(
        source.connectorId,
        source.name,
        id,
        source.type,
      );
      source.addListener(() => {
        adapter.setExternalSourceState(id, source.state);
      });
    }
  }

  setupOutside() {
    this.outside = new Outside();
    this.view.setOutsideModel(this.outside);
    this.outside.addListener(() => {
      this.setWidgetStatus('outside_id', this.outside.getId())
    });
    this.addCodecListener('outside_id', 'released', (value) => {
      this.outside.setOutside(value);
    });
  }

  setupProjector() {
    this.projector = new Projector();
    this.view.setProjectorModel(this.projector);

    this.projector.addListener(() => {
      this.setWidgetStatus(
        'projector_power',
        this.projector.isOn() ? 'on' : 'off',
      );
    });
    this.addCodecListener('projector_power', 'changed', (value) => {
      this.projector.toggle(value === 'on');
    });

    const tilt = false;
    this.canvas = new Curtain(tilt);
    this.view.setCanvasModel(this.canvas);
    this.addCodecListener('projector_canvas', 'pressed', (value) => {
      if (value === 'increment') {
        this.canvas.setSetpoint(0);
      } else {
        this.canvas.setSetpoint(100);
      }
    });
  }

  setupBlinds() {
    const allowTilt = true;
    this.curtain = new Curtain(allowTilt);
    this.view.setCurtainModel(this.curtain);

    this.addCodecListener('blinds', 'pressed', (value) => {
      if (value === 'increment') {
        this.curtain.upClicked();
      } else {
        this.curtain.downClicked();
      }
      this.unsetWidgetStatus('blinds_preset');
    });
    this.addCodecListener('blinds', 'released', () => {
      this.curtain.upOrDownReleased();
    });
    this.addCodecListener('blinds_preset', 'released', (value) => {
      this.curtain.setSetpoint(value);
      this.setWidgetStatus('blinds_preset', value);
    });
    this.setWidgetStatus('blinds_preset', 0); // TODO handle presets in model
  }

  setupLight() {
    this.lights = new Light();
    this.view.setLightsModel(this.lights);

    this.lights.addListener(() => {
      const light = this.lights.getLight();
      this.setWidgetStatus('lights_slider', (light * 255) / 100);
      this.setWidgetStatus('lights_toggle', light > 0 ? 'on' : 'off');
    });
    this.addCodecListener('lights_slider', 'changed', (value) => {
      this.lights.setLight((value * 100) / 255);
    });
    this.addCodecListener('lights_toggle', 'changed', (value) => {
      this.lights.switchLight(value === 'on');
    });
  }

  setupReset() {
    this.addCodecListener('reset_room', 'clicked', () => {
      this.lights.setLight(70); // this will be default when clicking on
      this.lights.switchLight(false);
      this.hvac.defaults();
      this.projector.toggle(false);
      this.canvas.setSetpoint(0);
      this.curtain.setSetpoint(0);
      this.setWidgetStatus('blinds_preset', 0); // TODO let model handle this
      this.view.cleanUp();
    });
  }

  setupStandby() {
    this.addCodecListener('standby', 'clicked', () => {
      if (this.codec.goToStandby) this.codec.goToStandby();
    });
  }

  setupSpeakerTrackDiagnostics() {
    this.addCodecListener('speakertrack_diagnostic_start', 'clicked', () => {
      if (this.codec.setSpeakerTrackDiagnostic) {
        this.codec.setSpeakerTrackDiagnostic(true);
      }
    });

    this.addCodecListener('speakertrack_diagnostic_stop', 'clicked', () => {
      if (this.codec.setSpeakerTrackDiagnostic) {
        this.codec.setSpeakerTrackDiagnostic(false);
      }
    });
  }

  format(value, decimals) {
    return value.toFixed(decimals);
  }

  setupHvac() {
    this.hvac = new ClimateController();
    this.view.setHvacModel(this.hvac);
    this.hvac.addListener((data) => {
      if (!data || data.actual) {
        this.setWidgetStatus(
          'temperature',
          this.format(this.hvac.getActual(), 1),
        );
      }
      if (!data || data.outdoor) {
        this.setWidgetStatus('weather', this.hvac.getWeather());
      }
      if (!data || data.setpoint) {
        this.setWidgetStatus(
          'temperature_setpoint',
          this.format(this.hvac.getSetpoint(), 1),
        );
      }
      if (!data || typeof data.power !== 'undefined') {
        this.setWidgetStatus(
          'hvac_power',
          this.hvac.isOn() ? 'active' : 'inactive',
        );
      }
    });
    this.addCodecListener('hvac_power', 'clicked', () => {
      this.hvac.toggle();
    });
    this.addCodecListener('temperature_setpoint', 'pressed', (value) => {
      if (value === 'increment') {
        this.hvac.increase();
      } else {
        this.hvac.decrease();
      }
    });
  }

  setWidgetStatus(widgetId, value) {
    this.throttler.setValue(widgetId, value);
  }

  unsetWidgetStatus(widgetId) {
    // Warning this is NOT throttled!
    if (this.codec) {
      this.codec.unsetWidgetStatus(widgetId);
    }
  }

  sendThrottled(widgetId, value) {
    if (this.codec) {
      this.codec.setWidgetStatus(widgetId, value);
    }
  }

  key(widgetId, event) {
    return `${widgetId}:${event}`;
  }

  onEvent(event) {
    // console.log(event);
    if (event.Extensions?.Widget?.Action) {
      const { WidgetId, Type, Value } = event.Extensions.Widget.Action;
      this.onWidgetEvent(WidgetId, Type, Value);
    }
    else if (event.Presentation?.ExternalSource?.Selected?.SourceIdentifier) {
      this.sourceList.onSourceSeleted(event.Presentation.ExternalSource.Selected.SourceIdentifier);
    }
    else {
      console.log('unknown event', event);
    }
  }

  onWidgetEvent(widgetId, event, value) {
    const callback = this.eventCallbacks.get(this.key(widgetId, event));
    if (callback) {
      callback(value);
    }
  }
}
