import $ from 'jquery';
import 'jqueryui';

async function fetchText(url) {
  const res = await fetch(url);
  return res.text();
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
  showTerminal: false,
  externalSourceConnector: 2,
  hasExternalSources: false,
  connectors: [
    // { Name: 'HDMI', id: 1, InputSourceType: 'PC' },
  ],

  init() {
    const device = localStorage.getItem('device');
    if (device) {
      this.device = JSON.parse(device);
    }

    $('.eventlog').resizable().draggable();
  },

  setCodec(codec) {
    this.codec = codec;

    codec.guiListener = event => this.onEvent(event);
  },

  onEvent(event) {

    const log = document.querySelector(".eventlog");
    this.events = this.events.concat([event]);

    log.scrollTop = log.scrollHeight;
  },

  async connect() {
    localStorage.setItem('device', JSON.stringify(this.device));
    try {
      await this.codec.connect(this.device);
      this.connected = true;
      this.hasUiExtensions = await this.codec.hasUiExtensions();
      this.connectors = await this.codec.getConnectorList();
      this.hasExternalSources = await this.codec.hasExternalSources();
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

  async addSources() {
    await this.adapter.initSources(this.externalSourceConnector);
    this.hasExternalSources = true;
    alert('The share tray now contains the media players in this room.');
  },

  async removeSources() {
    await this.codec.removeAllExternalSources();
    this.hasExternalSources = false;
    alert('The external sources were removed from the share tray.');
  },

  async installUiExtensions() {
    const lights = await fetchText('./assets/lights_blinds.xml');
    const climate = await fetchText('./assets/climate.xml');
    const media = await fetchText('./assets/media.xml');
    try {
      await this.codec.installUiExtension('uisim_lights', lights);
      await this.codec.installUiExtension('uisim_climate', climate);
      await this.codec.installUiExtension('uisim_media', media);
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
      await this.codec.removeUiExtension('uisim_media');
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
