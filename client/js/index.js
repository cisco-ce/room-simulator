import Alpine from 'alpinejs';

import SmallOffice from './smalloffice';
import RoomAdapter from './roomadapter';
import Codec from './codec';

Alpine.start();

async function getSvg() {
  const svg = await fetch('./images/exampleroom.svg');
  return svg.text();
}

async function init() {
  const room = await getSvg();
  const container = document.getElementById('simulator');
  container.innerHTML = room;
  const officeView = new SmallOffice(container);
  const adapter = new RoomAdapter(new Codec(), officeView);
  officeView.loadRoom();
  window.onEvent = (widgetId, event, value) => adapter.onEvent(widgetId, event, value);
}

init();
