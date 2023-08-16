
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

export default class Codec {

  constructor() {
    this.xapi = null;
    this.listener = null;
    this.guiListener = null;
  }

  connect(device) {
    const prot = 'wss://'; // location.protocol === 'https:' ? 'wss://' : 'ws://';
    const { username, password } = device;

    // remove ip and trailing slash if copied from browser
    const host = device.host.replace(/^https?:\/\//, '').replace(/\/$/, '');

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


  reportCommand(cmd) {
    if (this.guiListener) {
      this.guiListener(cmd);
    }
  }

  listen() {
    this.xapi.Event.UserInterface.on((event) => {
      if (this.listener) {
        this.listener(event);
      }
      if (this.guiListener) {
        this.guiListener(toText(event));
      }
    });
  }

  setListener(listener) {
    this.listener = listener;
  }

  installUiExtension(PanelId, xml, inControlPanel = false) {
    if (!this.xapi) return;
    if (inControlPanel) {
      xml = xml.replace(/<Location>.*?<\/Location>/g, '<Location>ControlPanel</Location>');
    }

    this.reportCommand(`xCommand UserInterface Extensions Panel Save PanelId: "${PanelId}" <XML config here>`)
    return this.xapi.Command.UserInterface.Extensions.Panel.Save({ PanelId }, xml);
  }

  removeUiExtension(PanelId) {
    if (!this.xapi) return;
    this.reportCommand(`xCommand UserInterface Extensions Panel Remove PanelId: "${PanelId}"`);
    return this.xapi.Command.UserInterface.Extensions.Panel.Remove({ PanelId });
  }

  async hasUiExtensions() {
    const list = await this.xapi.Command.UserInterface.Extensions.List();
    const panels = list.Extensions?.Panel || [];
    return panels.some(p => p.PanelId.startsWith('uisim_'));
  }

  async unsetWidgetStatus(WidgetId) {
    if (!this.xapi) return;
    try {
      this.reportCommand(`xCommand UserInterface Extensions Widget UnsetValue WidgetId: ${WidgetId}`);
      await this.xapi.Command.UserInterface.Extensions.Widget.UnsetValue({ WidgetId });
    }
    catch(e) {
    }
  }

  async setWidgetStatus(WidgetId, Value) {
    if (!this.xapi) return;
    try {
      this.reportCommand(`xCommand UserInterface Extensions Widget SetValue WidgetId: "${WidgetId}" Value: "${Value}"`);
      await this.xapi.Command.UserInterface.Extensions.Widget.SetValue({ WidgetId, Value });
    }
    catch(e) {
    }
  }

  async getConnectorList(skipCamera = true) {
    try {
      const list = await this.xapi.Config.Video.Input.Connector.get();
      return skipCamera ? list.filter(i => i.InputSourceType !== 'camera') : list;
    }
    catch(e) {
      console.warn('not able to retrieve connector list');
      return [];
    }
  }

  async isMtr() {
    if (!this.xapi) return false;
    try {
      const mtrVersion = await this.xapi.Status.SystemUnit.Extensions.Microsoft.Version.OEMAgent.get();
      return !!mtrVersion;
    }
    catch {
      return false;
    }
  }

  async hasExternalSources() {
    if (!this.xapi) return;
    const list = await this.xapi.Command.UserInterface.Presentation.ExternalSource.List();
    return list?.Source?.length > 0;
  }

  addExternalSource(ConnectorId, Name, SourceIdentifier, Type) {
    console.log('add source', Name, Type, 'to connector', ConnectorId);
    this.reportCommand(`xCommand UserInterface Presentation ExternalSource Add ConnectorId: ${ConnectorId} Name: "${Name}" SourceIdentifier: "${SourceIdentifier}" Type: "${Type}"`);
    this.xapi.command('UserInterface/Presentation/ExternalSource/Add', {
      ConnectorId,
      Name,
      SourceIdentifier,
      Type,
    });
  }

  removeAllExternalSources() {
    this.reportCommand('xCommand UserInterface Presentention ExternalSource RemoveAll');
    this.xapi.command('UserInterface/Presentation/ExternalSource/RemoveAll');
  }

  setExternalSourceState(SourceIdentifier, State) {
    // console.log('Set external source state', SourceIdentifier, State);
    this.reportCommand(`xCommand UserInterface Presentation ExternalSource State Set SourceIdentifier: "${SourceIdentifier}" State: "${State}"`);
    this.xapi.command('UserInterface/Presentation/ExternalSource/State/Set', {
      SourceIdentifier,
      State,
    });
  }

  selectExternalSource(SourceIdentifier) {
    if (!this.xapi) return;

    // console.log('Codec: Select external source', SourceIdentifier);
    if (SourceIdentifier) {
      this.reportCommand(`xCommand UserInterface Presentation ExternalSource Select SourceIdentifier: "${SourceIdentifier}"`);
      this.xapi.command('UserInterface/Presentation/ExternalSource/Select', {
        SourceIdentifier,
      }).catch(console.warn);
    }
  }
};