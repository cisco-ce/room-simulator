import Model from './model';

function limit(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Blind position is from 0-100 %, where 0 is open and 100 % is fully closed
 * Speed: -1 moves up (towards 0), +1 moves down
 * The tilt moves down (100) when the curtain moves down
 * The tilt moves up (0) when the curtain moves up
 */
export default class Curtain extends Model {
  constructor(hasTilting = false) {
    super();
    this.speed = 0; // -1 up, 0 stopped, 1 down
    this.percent = 0;
    this.MOVE_SPEED = 0.15;
    this.longPressTime = 1500;
    this.setPoint = null;
    this.lastPressTime = 0;
    this.hasTilting = hasTilting;
    this.tiltPos = 100; // 0 completely up, 50 fully horisontal, 100 completely down
    this.tiltSpeed = 0.8;
    this.shadeSound = new Audio('./sounds/shades.m4a');
  }

  upClicked() {
    this.speed = -1;
    this.setPoint = null;
    this.lastPressTime = new Date().getTime();
    this.start();
  }

  upOrDownReleased() {
    const time = new Date().getTime() - this.lastPressTime;
    if (time < this.longPressTime) {
      this.stop();
    }
  }

  downClicked() {
    this.speed = 1;
    this.setPoint = null;
    this.lastPressTime = new Date().getTime();
    this.start();
  }

  setSetpoint(percent) {
    this.setPoint = percent;
    this.speed = this.setPoint > this.percent ? 1 : -1;
    this.start();
    this.notify();
  }

  getPos() {
    return this.percent;
  }

  getTilt() {
    return this.tiltPos;
  }

  start() {
    if (!this.timer) {
      this.timer = setInterval(this.update.bind(this), 20);
      this.playSound();
    }
  }

  playSound() {
    this.shadeSound.currentTime = 2;
    this.shadeSound.loop = true;
    this.shadeSound.play();
  }

  getSetpoint() {
    return this.setPoint;
  }

  getTotalLightPercent() {
    const tiltClosed = Math.abs(50 - this.getTilt()) / 50;
    const indirect = this.getPos() * (1 - tiltClosed); // let in light if the tilt is open
    const direct = 100 - this.getPos();

    const totalOpening = indirect + direct;

    const closing = 100 - totalOpening;
    // make non-linear relationship. most darkening occur when window is almost closed
    const darkness = (100 * Math.pow(closing, 2)) / Math.pow(100, 2);
    return 100 - darkness;
  }

  stop() {
    this.speed = 0;
    this.setPoint = null;
    clearInterval(this.timer);
    this.timer = 0;
    this.shadeSound.pause();
  }

  update() {
    if (this.setPoint !== null) {
      if (Math.abs(this.setPoint - this.percent) < 0.5) {
        this.stop();
      }
    }

    if (this.hasTilting && this.speed < 0 && this.tiltPos > 0) {
      // need to move tilt up before moving blind
      this.tiltPos -= this.tiltSpeed;
    } else if (this.hasTilting && this.speed > 0 && this.tiltPos < 100) {
      // need to move tilt up before moving blind
      this.tiltPos += this.tiltSpeed;
    }
    this.tiltPos = limit(this.tiltPos, 0, 100);

    // move the blind
    this.percent = limit(this.percent + this.speed * this.MOVE_SPEED, 0, 100);

    if (
      (this.percent <= 0 && this.speed < 0) ||
      (this.percent >= 100 && this.speed > 0)
    ) {
      this.stop();
    }

    this.notify();
  }
}
