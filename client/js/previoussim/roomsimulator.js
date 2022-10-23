import $ from 'jquery';
import SmallOffice from './smalloffice/smalloffice';
import RoomAdapter from './smalloffice/roomadapter';
import Dialog from './dialog';
import ConfigXml from '../../examples/simulator.xml';
import Logger from './logger';

const DefaultThrottling = 100;
const HeartBeatTime = 20;
const PeripheralName = 'UIExtensionsSimulator';
const BackupKey = 'rceditor_backup';

function div(className, text) {
  return $('<div/>')
    .addClass(className)
    .text(text);
}

class RoomSimulator {
  constructor(codec, $context) {
    this.codec = codec;
    this.$context = $context;

    if (codec) {
      codec.addListener('event', this.onEvent.bind(this));
    }

    setTimeout(this.setup.bind(this), 500); // wait until the css has loaded
    window.codec = codec;
    window.simulator = this;
    document.title = 'UI Extensions Simulator';
    this.helpVisible = false;
  }

  setup() {
    $('body').addClass('simulator');
    this.addSimulatorContainer();
    this.addMenu();
    this.addHelpMenu();
    this.addHeader();
    this.setupRoom();
    this.createIdefix();
    this.setupLogger();
    this.setupDialog();
    this.setupHeartBeat();
    this.toggleMenu(false);
    this.verifyBrowser();
  }

  setupHeartBeat() {
    if (this.codec && this.codec.registerControlSystem) {
      this.codec.registerControlSystem(PeripheralName);
      this.codec.sendHeartBeat(PeripheralName);
      setInterval(() => {
        this.codec.sendHeartBeat(PeripheralName);
      }, HeartBeatTime * 1000);
    }
  }

  setupLogger() {
    this.logger = new Logger(this.codec);
    $('body').append(this.logger.getDomElement());
  }

  verifyBrowser() {
    const isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
    if (!isChrome) {
      const text = `The UI Extensions simulator may not work properly in your browser.
      <br/><br/>Please use Google Chrome instead.`;
      this.dialog.toast('Browser not supported', text);
    }
  }

  setupDialog() {
    this.$context.append($(Dialog.baseHtml()).hide());
    this.dialog = new Dialog(this.$context);
  }

  addSimulatorContainer() {
    this.simulatorContainer = $('<div/>').addClass(
      'simulatorRoom content-body',
    );
    this.$context.append(this.simulatorContainer);
    this.simulatorContainer.click(() => {
      this.hideIdefix();
      this.toggleMenu(true);
    });
  }

  addHeader() {
    const header = $('<div/>').addClass('header');
    const room1 = $('<span/>').text('Example room');
    header.append(room1);

    const menuButton = $('<div/>').addClass('simulatorMenuButton clickable');
    menuButton.click(() => this.toggleMenu());
    header.append(menuButton);

    const helpButton = $('<div/>')
      .addClass('helpButton clickable')
      .text('?');
    header.append(helpButton);

    this.$context.append(header);

    const codec = $('<div/>').addClass('simulatorCodecName');
    Promise.resolve(this.codec ? this.codec.getCodecName() : 'NO CODEC').then(
      (name) => {
        codec.text(name);
      },
    );
    this.$context.append(codec);
  }

  toggleMenu(hideIt) {
    if (!hideIt) this.setHelpVisible(false);
    this.$context.find('.menu').toggleClass('hidden', hideIt);
  }

  addMenu() {
    const menu = $('<div/>').addClass('menu hidden');
    this.$context.append(menu);
    menu.append(div('title', 'Simulator'));
    menu.append(
      div(
        'subtext',
        'Try out how the whole meeting experience can be managed using UI Extensions.',
      ),
    );

    const links = div('links');

    const loadConfigButton = div('clickable', 'Load simulator config');
    loadConfigButton.click(this.loadConfig.bind(this));
    links.append(loadConfigButton);

    const clearConfigButton = div('clickable', 'Clean up');
    clearConfigButton.click(this.clearConfig.bind(this));
    links.append(clearConfigButton);

    const logButton = div('clickable', 'Show API log');
    // links.append(logButton);
    logButton.click(this.showLogger.bind(this));

    let tip = 'Simulator-side throttling time in ms.\nNo throttling: 0';
    tip += `\nDefault: ${DefaultThrottling}`;
    const input = $(
      `<input class='throttling' type='text' title='${tip}'>`,
    ).val(DefaultThrottling);
    input.change(this.throttlingChanged.bind(this));
    const throttling = $('<div/>')
      .text('Throttling: ')
      .append(input);
    links.append(throttling);
    throttling.hide();
    menu.append(links);

    menu.dblclick(() => throttling.toggle());
  }

  clearConfig() {
    const msg = `This will remove the current configuration.
    Any backed up configuration will be restored`;

    const hasBackup = !!localStorage.getItem(BackupKey);

    this.dialog.confirm('Cleanup?', msg, () => {
      if (hasBackup) {
        this.codec.setConfigOnCodec(localStorage.getItem(BackupKey));
      } else {
        this.codec.deleteConfigFromCodec();
      }
      localStorage.removeItem(BackupKey);
    });
  }

  addHelpMenu() {
    const menu = $('<div/>')
      .addClass('help-menu hidden')
      .text('help here');
    this.$context.append(menu);
    menu.append(div('title', 'Guide'));
    menu.append(
      div(
        'subtext',
        `Interact with the room by clicking the numbered parts, or use
    the custom panels on a virtual or physical Touch 10 controller.`,
      ),
    );

    menu.append(div('help-item', '1'));
    menu.append(div('help-item-header', 'Touch 10'));
    menu.append(
      div(
        'subtext',
        `Bring up a virtual Touch 10 with custom panels for controlling
    the simulated room. Items 2-6 can be controlled from the panels, without having to get out
    of your seat.`,
      ),
    );

    menu.append(div('help-item', '2'));
    menu.append(div('help-item-header', 'Blinds'));
    menu.append(
      div(
        'subtext',
        `Tap the switches to move blinds up and down slightly, long press
    to open or close them entirely.`,
      ),
    );

    menu.append(div('help-item', '3'));
    menu.append(div('help-item-header', 'Lights'));
    menu.append(
      div(
        'subtext',
        `Tap the switches to turn lights on or off. Long press to dim
    the light manually.`,
      ),
    );

    menu.append(div('help-item', '4'));
    menu.append(div('help-item-header', 'Projector canvas'));
    menu.append(
      div('subtext', 'Tap the switches to brint the canvas up or down.'),
    );

    menu.append(div('help-item', '5'));
    menu.append(div('help-item-header', 'Projector'));
    menu.append(div('subtext', 'Tap to turn the projector on or off.'));

    menu.append(div('help-item', '6'));
    menu.append(div('help-item-header', 'Climate control'));
    menu.append(
      div(
        'subtext',
        `The ventilation system can only be controlled from the Touch 10
    panel`,
      ),
    );

    menu.append(div('help-item', '7'));
    menu.append(div('help-item-header', 'External video switch'));
    menu.append(
      div(
        'subtext',
        'Video sources connected through an external video switch.',
      ),
    );
  }

  throttlingChanged(e) {
    const time = parseInt($(e.target).val(), 10);
    $(e.target).blur();
    this.throttler.setThrottlingInterval(time);
  }

  loadConfig() {
    const success = () => {
      this.dialog.toast('Success', 'Example room loaded');
    };
    const error = () => {
      this.dialog.toast('Error', 'Unable to load example room');
    };

    this.backupConfig();
    this.dialog.confirm(
      'Export to codec?',
      `By exporting the example room config, you will be able to control the example room with a
      Touch10. <p/>Any existing configuration will be temporarily backed up in your browser.`,
      () => {
        this.codec.setConfigOnCodec(ConfigXml, success, error);
      },
    );
  }

  backupConfig() {
    this.codec.getConfigFromCodec((xml) =>
      localStorage.setItem(BackupKey, xml),
    );
  }

  showLogger() {
    this.logger.show();
  }

  setupRoom() {
    this.view = new SmallOffice();
    this.room = new RoomAdapter(this.codec, this.view);
    const theOffice = this.view.getDomElement();
    this.simulatorContainer.empty().append(theOffice);
    $(theOffice)
      .hide()
      .fadeIn(1300);
    this.view.setIdefixHandler(this.openIdefix.bind(this));
    $('.helpButton').click(() => this.setHelpVisible(!this.helpVisible));
  }

  setHelpVisible(visible) {
    if (visible) this.toggleMenu(true);
    this.helpVisible = visible;
    this.view.setOnScreenHelpVisible(this.helpVisible);
    this.$context.find('.help-menu').toggleClass('hidden', !visible);
  }

  onEvent(widgetId, event, value) {
    this.room.onEvent(widgetId, event, value);
  }

  createIdefix() {
    const iframe = $('<iframe/>')
      .addClass('idefixIframe')
      .attr('src', '?idefixclient');
    this.$context.append(iframe);
    this.hideIdefix();
  }

  blurSimulator(isBlurred) {
    this.$context.find('.simulatorRoom').toggleClass('blur', isBlurred);
  }

  hideIdefix() {
    $('.idefixIframe').addClass('hiddenIdefix');
    this.blurSimulator(false);
  }

  openIdefix(e) {
    e.stopImmediatePropagation();
    $('.idefixIframe')
      .contents()
      .find('body')
      .css('background', 'transparent');
    this.blurSimulator(true);
    setTimeout(() => $('.idefixIframe').removeClass('hiddenIdefix'), 100);
  }
} // class

export default function initSimulator(codec, $context) {
  const simulator = new RoomSimulator(codec, $context);
  window.simulator = simulator;
  return simulator;
}
