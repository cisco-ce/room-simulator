import Snap from 'snapsvg-cjs'
import $ from 'jquery';

import Blinds from './views/blinds';
import Monitor from './views/monitor';
import Switch from './views/switch';
import Projector from './views/projector';
import Drone from './views/drone';
import HVAC from './views/hvac';
import Canvas from './views/canvas';
import RoomLightAmbience from './views/ambience';

function showClickCoords(e) {
  // const x = e.offsetX * 1366 / $('.roomView').width();
  // const y = e.offsetY * 768 / $('.roomView').height();
  console.log('click', e.offsetX, e.offsetY);
}

function paintRoom(root) {
  root.select('#right_wall_1_ .st15').attr('style', 'fill: #F5F5F5');
}


export default class SmallOffice {
  constructor() {
    const snap = new Snap('#exampleroom');
    this.element = snap;
    snap.node.onclick = showClickCoords.bind(this);
  }

  hideUnused() {
    this.setElementVisible('#phone_1_', false);
    this.setElementVisible('#lightfx-switch-canvas', false);
    this.setElementVisible('#switch-HVAC_2_', false);
    this.setElementVisible('#laptop_1_', false);
    this.setOnScreenHelpVisible(false);
  }

  setOnScreenHelpVisible(visible) {
    this.setElementVisible('#explain', visible);
  }

  getDomElement() {
    return this.element.node;
  }

  loadRoom() {
    this.root = Snap('#outside').parent();
    const shade = document.getElementById('room-brightness_1_');

    this.ambience = new RoomLightAmbience(shade);
    this.setupCanvas();
    this.setupProjector(this.root);
    this.setupBlinds(this.root);
    this.setupLamps();
    this.setupHvac();
    this.setupSwitches(this.root);
    this.setupMonitors(this.root);
    this.setupMediaPlayers(this.root);
    this.setupOutsideWorld(this.root);
    paintRoom(this.root);
    this.setupDrone(this.root);
    this.hideUnused();
    this.addHints();
  }

  setupCanvas() {
    this.setElementVisible('#canvas', false);
    this.setElementVisible('#canvas-shadow', false);
    const canvasArea = [980, 246, 1293, 97, 1293, 642, 980, 512];
    const pc = this.root.select('#projector-canvas_1_');
    const window = [1004, 329, 1106, 310, 1106, 569, 1004, 525];
    this.canvas = new Canvas(pc, canvasArea, window);
    this.canvasModel.addListener(() => {
      this.canvas.setPosition(this.canvasModel.getPos());
      this.ambience.setCorridorLight(this.canvas.getLightPercent());
    });
  }

  setupMonitors(root) {
    const layer = root.select('#lightfx_1_');
    this.osd1 = new Monitor(layer, 511, 377, 169, 96);
    this.osd2 = new Monitor(layer, 686, 377, 169, 96);
    this.setOsdImage();

    // this.mac = new Monitor(layer, 618, 563, 130, 75);
    // this.mac
    //   .click(() => this.mac.toggle())
    //   .addClass('clickable')
    //   .attr('id', 'osx');
    // this.mac.setImage('/images/osx.jpg');

    this.idefix = new Monitor(layer, 805, 587, 95, 60);
    this.idefix
      .click(this.idefixClicked.bind(this))
      .addClass('clickable')
      .attr('id', 'idefix');
    this.idefix.setImage('/images/wallpaper.png');

    setTimeout(() => {
      this.osd1.set(true);
      this.osd2.set(true);
      this.idefix.set(true);
    }, 1000);
  }

  setupMediaPlayers(root) {
    this.sourcesModel.addListener(() => {
      const source = this.sourcesModel.getSelectedSourceIdentifier();
      this.setOsdImage(source);
    });
    const appleTv = new Switch(root, 435, 451, 54, 10, 'appletv-switch');
    appleTv.click(() => {
      const isOn = this.sourcesModel.togglePower('appletv');
      this.setElementVisible('#lightfx-apple-tv', isOn);
    });
    const tv = new Switch(root, 435, 473, 54, 10, 'tv-switch');
    tv.click(() => {
      const isOn = this.sourcesModel.togglePower('tv');
      this.setElementVisible('#lightfx-tv-decoder', isOn);
    });
    const bluray = new Switch(root, 435, 494, 54, 10, 'bluray-switch');
    bluray.click(() => {
      const isOn = this.sourcesModel.togglePower('bluray');
      this.setElementVisible('#lightfx-blu-ray', isOn);
    });
  }

  setupOutsideWorld(root) {
    const data = {};
    const url = '/images/city.png';
    // const url = '/images/beach.jpg';

    const x1 = 30 + (data.x ? data.x : 0);
    const y1 = 150 + (data.y ? data.y : 0);
    const w = data.w ? data.w : 887;
    const h = data.h ? data.h : 516;
    const maskFront = this.blindsFront.getOutsideMask();
    const maskBack = this.blindsBack.getOutsideMask();
    const windows = root.group(maskFront, maskBack);
    this.outside = root.image(url, x1, y1, w, h);
    this.outside.attr({ mask: windows });
    this.outside.insertAfter(root.select('#room-brightness_1_'));
  }

  setupRightWindow(root) {
    const url = '/images/city.png';
    const x1 = 979;
    const y1 = 306 - 50;
    const h = 584 - y1;
    const w = (h * 16) / 9;
    this.rightWindow = root.image(url, x1, y1, w, h);

    // right window
    const mask = this.canvas.outsideMask;
    this.rightWindow.attr({ mask });
    this.rightWindow.insertAfter(root.select('#room-brightness_1_'));

    // faded glasses
    // root.polygon(win).attr({ fill: 'white', fillOpacity: 0.3 });
  }

  addHints() {
    this.addHint('#projector-switch', 'Projector: Click to toggle power.');
    this.addHint('#tv-switch', 'TV set-top box: Click to toggle power.');
    this.addHint('#appletv-switch', 'Apple TV: Click to toggle power.');
    this.addHint('#bluray-switch', 'Bluray player: Click to toggle power.');
    this.addHint(
      '#blinds-up-switch',
      'Blinds: Tap to move up slightly, long press to open.',
    );
    this.addHint(
      '#blinds-down-switch',
      'Blinds: Tap to move slightly, long press to close.',
    );
    this.addHint(
      '#lights-up-switch',
      'Lights: Tap to turn on, long press to dim up.',
    );
    this.addHint(
      '#lights-down-switch',
      'Lights: Tap to turn off, long press to dim down.',
    );
    this.addHint('#canvas-up-switch', 'Projector canvas: Tap to move up.');
    this.addHint('#canvas-down-switch', 'Projector canvas: Tap to move down.');
    this.addHint('#idefix', 'Touch 10. Tap to open virtual touch panel.');
    this.addHint('#osx', 'Laptop. Click to toggle power.');
  }

  addHint(element, text) {
    // TODO
    // const hint = Snap.parse(`<title>${text}</title>`);
    // this.element.select(element).append(hint);
  }

  setOsdImage(sourceIdentifier) {
    let url;

    switch (sourceIdentifier) {
      case 'appletv':
        url = '/images/appletv.jpg';
        break;
      case 'bluray':
        url = '/images/bluray.jpg';
        break;
      case 'tv':
        url = '/images/tv.jpg';
        break;
      default:
        url = '/images/wallpaper.png';
    }

    this.osd1.setImage(url);
    this.osd2.setImage(url);
  }

  setupHvac() {
    this.hvac = new HVAC(this.hvacModel);
  }

  setupLamps() {
    // show lightfx layer but hide all effects except lamps
    this.setElementVisible('#lightfx_1_', true);
    this.setElementVisible('#lightfx-right-back-window', false);
    this.setElementVisible('#lightfx-left-back-window_1_', false);
    this.setElementVisible('#lightfx-left-front-window', false);
    this.setElementVisible('#lightfx-projector_1_', false);

    this.lampModel.addListener(() => {
      this.ambience.setLampLight(this.lampModel.getLight());
      this.projector.setAmbience(this.ambience.getDarkness());
      const max = 0.8;
      const opacity = (max * this.lampModel.getLight()) / 100;
      this.find('#lightfx-ceiling_1_').attr('fill-opacity', opacity);
    });
  }

  setupProjector(root) {
    this.projector = new Projector(root, this.projectorModel);
    const projection = this.projector.canvasImage;
    projection.attr({ mask: this.canvas.getMask() });
  }

  setupDrone(root) {
    this.drone = new Drone(root);
  }

  setupBlinds(root) {
    const backWindow = [260, 237, 362, 273, 362, 524, 260, 569];
    const frontWindow = [37, 160, 214, 222, 214, 588, 37, 665];

    // TODO put it on light layer instead. #lightfx_1_
    this.blindsFront = new Blinds(
      root,
      root.select('#left-windows'),
      frontWindow,
      true,
    );
    this.blindsBack = new Blinds(
      root,
      root.select('#left-windows'),
      backWindow,
      true,
    );

    // hide designers blinds from svg
    this.setElementVisible('#left-back-blinds', false);
    this.setElementVisible('#left-front-blinds', false);
    this.setElementVisible('#shadow-left-back-window', false);
    this.setElementVisible('#shadow-left-front-window', false);

    this.curtainModel.addListener(() => {
      this.blindsFront.drawBlinds(
        this.curtainModel.getPos(),
        this.curtainModel.getTilt(),
      );
      this.blindsBack.drawBlinds(
        this.curtainModel.getPos(),
        this.curtainModel.getTilt(),
      );
      this.ambience.setNaturalLight(this.curtainModel.getTotalLightPercent());
      this.projector.setAmbience(this.ambience.getDarkness());
    });

    // make sure light rays are above room darkness
    this.blindsFront.getBeams().insertAfter(root.select('#room-brightness_1_'));
    this.blindsBack.getBeams().insertAfter(root.select('#room-brightness_1_'));
  }

  setupSwitches(root) {
    this.switchBlindsUp = new Switch(root, 432, 401, 11, 6, 'blinds-up-switch');
    this.switchBlindsDown = new Switch(
      root,
      432,
      411,
      11,
      6,
      'blinds-down-switch',
    );
    this.switchBlindsUp.mousedown(() => this.curtainModel.upClicked());
    this.switchBlindsUp.mouseup(() => this.curtainModel.upOrDownReleased());
    this.switchBlindsUp.click(() => {}); // prevent propagation
    this.switchBlindsDown.mousedown(() => this.curtainModel.downClicked());
    this.switchBlindsDown.mouseup(() => this.curtainModel.upOrDownReleased());
    this.switchBlindsDown.click(() => {}); // prevent propagation

    this.switchCanvasUp = new Switch(root, 932, 398, 15, 9, 'canvas-up-switch');
    this.switchCanvasUp.mousedown(() => this.canvasModel.setSetpoint(0));
    this.switchCanvasDown = new Switch(
      root,
      932,
      411,
      15,
      9,
      'canvas-down-switch',
    );
    this.switchCanvasDown.mousedown(() => this.canvasModel.setSetpoint(100));
    this.switchCanvasUp.click(() => {}); // prevent propagation
    this.switchCanvasDown.click(() => {}); // prevent propagation

    this.switchLightUp = new Switch(root, 909, 398, 15, 9, 'lights-up-switch');
    this.switchLightDown = new Switch(
      root,
      909,
      411,
      15,
      9,
      'lights-down-switch',
    );
    this.switchLightUp.mousedown(() => this.lampModel.lightUpPressed());
    this.switchLightDown.mousedown(() => this.lampModel.lightDownPressed());
    this.switchLightUp.mouseup(() => this.lampModel.lightUpReleased());
    this.switchLightDown.mouseup(() => this.lampModel.lightDownReleased());
    this.switchLightUp.click(() => {}); // prevent propagation
    this.switchLightDown.click(() => {}); // prevent propagation
  }

  find(id) {
    return this.root.select(id);
  }

  setElementVisible(selector, visible) {
    $(this.element.node)
      .find(selector)
      .toggle(visible);
  }

  setIdefixHandler(handler) {
    this.idefixHandler = handler;
  }

  setCurtainModel(model) {
    this.curtainModel = model;
  }

  setSourceModel(model) {
    this.sourcesModel = model;
  }

  setHvacModel(model) {
    this.hvacModel = model;
  }

  setCanvasModel(model) {
    this.canvasModel = model;
  }

  setProjectorModel(model) {
    this.projectorModel = model;
  }

  setLightsModel(model) {
    this.lampModel = model;
  }

  idefixClicked(e) {
    if (this.idefixHandler) {
      this.idefixHandler(e);
    }
  }

  deliverCoke() {
    this.drone.justDoIt();
  }

  cleanUp() {
    this.drone.cleanUp();
  }
}
