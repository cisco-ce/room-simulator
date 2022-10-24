export default class Codec {

  constructor() {
    this.xapi = null;
    this.listener = null;
  }

  connect(device) {
    const prot = location.protocol === 'https:' ? 'wss://' : 'ws://';
    const { host, username, password } = device;
    console.log('connecting to', prot + host, username);
    const connect = new Promise((resolve, reject) => {
      window.jsxapi.connect(prot + host, { username, password })
        .on('ready', async (xapi) => {
          this.xapi = xapi;
          this.listen();
          resolve();
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

  listen() {
    this.xapi.Event.UserInterface.on((event) => {
      if (this.listener) {
        this.listener(event);
      }
    });
  }

  setListener(listener) {
    this.listener = listener;
  }

  unsetWidgetStatus(WidgetId) {
    if (!this.xapi) return;
    this.xapi.Command.UserInterface.Extensions.Widget.UnsetValue({ WidgetId });
  }

  setWidgetStatus(WidgetId, Value) {
    if (!this.xapi) return;
    this.xapi.Command.UserInterface.Extensions.Widget.SetValue({ WidgetId, Value });
  }
};