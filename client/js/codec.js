export default class Codec {

  constructor() {
    this.xapi = null;
    this.listener = null;
    this.guiListener = null;
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
      if (this.guiListener) {
        this.guiListener(event);
      }
    });
  }

  setListener(listener) {
    this.listener = listener;
  }

  installUiExtension(PanelId, xml) {
    if (!this.xapi) return;
    return this.xapi.Command.UserInterface.Extensions.Panel.Save({ PanelId }, xml);
  }

  removeUiExtension(PanelId) {
    if (!this.xapi) return;
    return this.xapi.Command.UserInterface.Extensions.Panel.Remove({ PanelId });
  }

  async hasUiExtensions() {
    const list = await this.xapi.Command.UserInterface.Extensions.List();
    const panels = list.Extensions?.Panel || [];
    const lights =  panels.find(p => p.PanelId === 'uisim_lights');
    const climate =  panels.find(p => p.PanelId === 'uisim_climate');
    return !!(lights && climate);
  }

  async unsetWidgetStatus(WidgetId) {
    if (!this.xapi) return;
    try {
      await this.xapi.Command.UserInterface.Extensions.Widget.UnsetValue({ WidgetId });
    }
    catch(e) {
    }
  }

  async setWidgetStatus(WidgetId, Value) {
    if (!this.xapi) return;
    try {
      await this.xapi.Command.UserInterface.Extensions.Widget.SetValue({ WidgetId, Value });
    }
    catch(e) {
    }
  }

  async getConnectorList(skipCamera = true) {
    const list = await this.xapi.Config.Video.Input.Connector.get();
    return skipCamera ? list.filter(i => i.InputSourceType !== 'camera') : list;
  }

  addExternalSource(ConnectorId, Name, SourceIdentifier, Type) {
    console.log('add source', Name, Type, 'to connector', ConnectorId);
    this.xapi.command('UserInterface/Presentation/ExternalSource/Add', {
      ConnectorId,
      Name,
      SourceIdentifier,
      Type,
    });
  }

  removeAllExternalSources() {
    this.xapi.command('UserInterface/Presentation/ExternalSource/RemoveAll');
  }

  setExternalSourceState(SourceIdentifier, State) {
    // console.log('Set external source state', SourceIdentifier, State);
    this.xapi.command('UserInterface/Presentation/ExternalSource/State/Set', {
      SourceIdentifier,
      State,
    });
  }

  selectExternalSource(SourceIdentifier) {
    if (!this.xapi) return;

    // console.log('Codec: Select external source', SourceIdentifier);
    if (SourceIdentifier) {
      this.xapi.command('UserInterface/Presentation/ExternalSource/Select', {
        SourceIdentifier,
      });
    }
  }
};