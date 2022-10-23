import jsxapi from 'jsxapi';

function connectToDevice(device) {
  const prot = location.protocol === 'https:' ? 'wss://' : 'ws://';
  const { host, username, password } = device;
  console.log('connecting to', prot + host, username, password);
  const connect = new Promise((resolve, reject) => {
    jsxapi.connect(prot + host, { username, password })
      .on('ready', async (xapi) => {
        resolve(xapi);
      })
      .on('error', (e) => {
        reject(e);
      })
  });

  const maxTime = 5000;
  const timeout = new Promise((res, reject) => setTimeout(reject, maxTime));

  return Promise.race([
    connect, timeout,
  ]);
}

const gui = {
  showConnect: false,
  connected: false,
  device: {
    host: '',
    username: '',
    password: '',
  },

  init() {
    console.log('init gui');
  },

  async connect() {
    try {
      connectToDevice(this.device);
    }
    catch(e) {
      console.warn('Not able to connect');
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
