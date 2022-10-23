import SmallOffice from './smalloffice';
import RoomAdapter from './roomadapter';
import Codec from './codec';

async function getSvg() {
  const svg = await fetch('./images/exampleroom.svg');
  return svg.text();
}

async function init() {
  const room = await getSvg();
  document.body.innerHTML = room;
  const officeView = new SmallOffice();
  const adapter = new RoomAdapter(new Codec(), officeView);
  officeView.loadRoom();
  window.onEvent = (widgetId, event, value) => adapter.onEvent(widgetId, event, value);
}

init();
