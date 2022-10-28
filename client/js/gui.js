async function fetchText(url) {
  const res = await fetch(url);
  return res.text();
}

function toText(event) {
  if (event.Extensions?.Widget?.Action) {
    const e = event.Extensions?.Widget?.Action;
    const path = 'UserInterface Extension Widget Action';
    const w = `WidgetId: "${e.WidgetId}"`;
    const t = `Type: "${e.Type}"`;
    const v = `Value: "${e.Value}"`;
    return `${path} ${w} \n${path} ${t} \n${path} ${v}`;
  }
  else if (event.Extensions?.Panel?.Clicked) {
    const id = event.Extensions.Panel.Clicked.PanelId;
    return `UserInterface Extensions Panel Clicked PanelId: "${id}"`;
  }
  else if (event.Presentation?.ExternalSource?.Selected?.SourceIdentifier) {
    const id = event.Presentation?.ExternalSource?.Selected?.SourceIdentifier;
    return `UserInterface Presentation ExternalSource Selected SourceIdentifier: "${id}"`
  }
}

const gui = {
  showConnect: false,
  connected: false,
  device: {
    host: '',
    username: '',
    password: '',
  },
  events: ['Welcome to\nCisco Codec RoomOS\n'],
  adapter: null,
  hasUiExtensions: false,
  codec: null,
  showEvents: false,
  externalSourceConnector: 2,

  init() {
    const device = localStorage.getItem('device');
    if (device) {
      this.device = JSON.parse(device);
    }
  },

  setCodec(codec) {
    this.codec = codec;

    codec.guiListener = event => {
      this.events = this.events.concat([toText(event)]);
    }
  },

  async connect() {
    localStorage.setItem('device', JSON.stringify(this.device));
    try {
      await this.codec.connect(this.device);
      this.connected = true;
      this.hasUiExtensions = await this.codec.hasUiExtensions();
      this.adapter.initSources(this.externalSourceConnector);
      this.setCodec(this.codec);
    }
    catch(e) {
      alert('Not able to connect. Did you accept the device\'s certificate?');
      console.warn('Not able to connect', e);
    }
  },

  connectValid() {
    return this.device.host && this.device.username;
  },

  showConnectDialog(show) {
    this.showConnect = show;
  },

  addSources() {
    this.adapter.initSources(this.externalSourceConnector);
  },

  removeSources() {
    this.codec.removeAllExternalSources();
  },

  async installUiExtensions() {
    const lights = await fetchText('./assets/lights_blinds.xml');
    const climate = await fetchText('./assets/climate.xml');
    try {
      await this.codec.installUiExtension('uisim_lights', lights);
      await this.codec.installUiExtension('uisim_climate', climate);
      this.hasUiExtensions = true;
      alert('UI Extensions are now available on your touch screen or touch panel');
    }
    catch(e) {
      console.error(e);
      alert('Not able to install UI extension');
    }
  },

  async removeUiExtensions() {
    try {
      await this.codec.removeUiExtension('uisim_lights');
      await this.codec.removeUiExtension('uisim_climate');
      this.hasUiExtensions = false;
      alert('UI extensions removed');
    }
    catch(e) {
      console.error(e);
      alert('Not able to remove UI extensions');
    }
  },
};

export default gui;
