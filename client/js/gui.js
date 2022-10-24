const gui = {
  showConnect: false,
  connected: false,
  device: {
    host: '',
    username: '',
    password: '',
  },
  codec: null,

  init() {
    console.log('init gui');
    const device = localStorage.getItem('device');
    if (device) {
      this.device = JSON.parse(device);
    }
  },

  setCodec(codec) {
    this.codec = codec;
  },

  async connect() {
    localStorage.setItem('device', JSON.stringify(this.device));
    try {
      await this.codec.connect(this.device);
      this.connected = true;
      this.showConnect = false;
    }
    catch(e) {
      console.warn('Not able to connect', e);
    }
  },

  connectValid() {
    return this.device.host && this.device.username;
  },

  showConnectDialog(show) {
    this.showConnect = show;
  },

};

export default gui;
