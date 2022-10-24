const DEFAULT_THROTTLING = 100; // ms

export default class Throttler {
  constructor(callback, updateInterval = DEFAULT_THROTTLING) {
    this.valueQueue = new Map();
    this.callback = callback;
    if (typeof callback !== 'function') {
      throw new Error('Throttler: You need to provide callback');
    }
    this.updateInterval = updateInterval;
  }

  /* zero to disable throttling */
  setThrottlingInterval(intervalMs) {
    this.updateInterval = intervalMs;
  }

  setValue(id, data) {
    const throttlingEnabled = this.updateInterval > 0;
    if (throttlingEnabled) {
      this.valueQueue.delete(id); // to ensure insertion order
      this.valueQueue.set(id, data);
      this._runTimer();
    } else if (this.callback) {
      this.callback(id, data);
    }
  }

  _runTimer() {
    if (!this.timer) {
      this.timer = setInterval(this._update.bind(this), this.updateInterval);
      // console.log("throttler: start");
    }
  }

  _stopTimer() {
    // console.log("stop throttler");
    clearInterval(this.timer);
    this.timer = 0;
  }

  _update() {
    if (this.valueQueue.size === 0) {
      this._stopTimer();
      return;
    }

    for (const [id, data] of this.valueQueue) {
      this.callback(id, data);
      this.valueQueue.delete(id);
    }
  }
}
