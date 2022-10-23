import Model from './model';

export default class Projector extends Model {
  constructor() {
    super();
    this.on = false;
  }

  toggle(on) {
    if (typeof on === 'undefined') {
      this.on = !this.on;
    } else {
      this.on = on;
    }

    this.notify();
  }

  isOn() {
    return this.on;
  }
}
