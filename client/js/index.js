import Alpine from 'alpinejs';

import SmallOffice from './views/office';
import RoomAdapter from './roomadapter';
import Codec from './codec';

import gui from './gui';

const codec = new Codec();

// make the gui model available to index.html:
window.gui = gui;
window.codec = codec;
gui.setCodec(codec);

Alpine.start();

async function init() {
  const officeView = new SmallOffice();
  const adapter = new RoomAdapter(codec, officeView);
  gui.adapter = adapter;
  const container = document.getElementById('simulator');
  await officeView.loadRoom(container);

  // todo for dev testing
  window.onWidgetEvent = (widgetId, event, value) => adapter.onWidgetEvent(widgetId, event, value);
}

init();
