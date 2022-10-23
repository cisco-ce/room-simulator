import Model from './model.js';

export default class Light extends Model {
  constructor() {
    super();
    this.setLight(0);
    this.stopTimer();
    this.lightChanging = 0;
    this.pressTime = 0;
  }

  setLight(percent) {
    this.percent = Math.max(Math.min(percent, 100), 0);
    this.notify();
  }

  getLight() {
    return this.percent;
  }

  lightUpPressed() {
    this.lightChanging = 1;
    this.startTimer();
    this.pressTime = new Date().getTime();
  }

  lightDownPressed() {
    this.lightChanging = -1;
    this.startTimer();
    this.pressTime = new Date().getTime();
  }

  lightUpReleased() {
    this.stopTimer();
    this.lightChanging = 0;
    const now = new Date().getTime();

    const longPressTime = 300;
    const clickTime = now - this.pressTime;
    if (clickTime < longPressTime) {
      this.setLight(100);
    }
  }

  lightDownReleased() {
    this.stopTimer();
    this.lightChanging = 0;
    const now = new Date().getTime();

    const longPressTime = 300;
    const clickTime = now - this.pressTime;
    if (clickTime < longPressTime) {
      this.setLight(0);
    }
  }

  startTimer() {
    const updateInterval = 50;
    if (this.timer <= 0) {
      this.timer = setInterval(this.update.bind(this), updateInterval);
    }
  }

  update() {
    this.setLight(this.getLight() + 2 * this.lightChanging);
  }

  stopTimer() {
    clearInterval(this.timer);
    this.timer = -1;
  }

  switchLight(on) {
    if (on) {
      this.setLight(this.previousPercent ? this.previousPercent : 100);
    } else {
      this.previousPercent = this.percent;
      this.setLight(0);
    }
  }

  toggleLight() {
    this.switchLight(!this.percent > 0);
  }
}
