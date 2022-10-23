import Model from './model';

const UPDATE_INTERVAL = 10 * 1000;

export default class ClimateController extends Model {
  constructor() {
    super();
    this.defaults();
    this.actual = 16.0;
    this.outdoor = 12.0;
    this.timer = setInterval(this.update.bind(this), UPDATE_INTERVAL);
    this.update();
  }

  defaults() {
    this.setSetpoint(21);
    this.toggle(false);
  }

  getSetpoint() {
    return this.setpoint;
  }

  getActual() {
    return this.actual;
  }

  setSetpoint(temp) {
    this.setpoint = this.limit(temp, 10, 30);
    this.notify({ setpoint: this.setpoint });
  }

  increase() {
    this.setSetpoint(this.setpoint + 0.5);
  }

  decrease() {
    this.setSetpoint(this.setpoint - 0.5);
  }

  toggle(on) {
    if (typeof on === 'undefined') {
      this.on = !this.on;
    } else {
      this.on = on;
    }
    this.notify({ power: this.on });
  }

  isOn() {
    return this.on;
  }

  /* <0, -100> if cooling, <0, 100> if heating, 0 if off */
  currentEffect() {
    if (!this.on) {
      return 0;
    }

    const effect = 20 * (this.setpoint - this.actual);
    return this.limit(effect, -100, 100);
  }

  getWeather() {
    const temp = this.getOutdoor().toFixed(1);
    return `Partly cloudy. Temperature: ${temp} (C)`;
  }

  getOutdoor() {
    return this.outdoor;
  }

  update() {
    this.outdoor = 12 + (Math.random() - 0.5);
    if (this.on) {
      this.actual += (this.setpoint - this.actual) * 0.1;
      this.notify({ actual: this.actual, outdoor: this.outdoor });
    }
  }
}
