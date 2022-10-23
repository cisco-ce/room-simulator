export default class Model {
  constructor() {
    this.removeListeners();
  }

  removeListeners() {
    this.listeners = [];
  }

  addListener(listener) {
    this.listeners.push(listener);
    this.notify();
  }

  notify(data) {
    for (const listener of this.listeners) {
      listener(data);
    }
  }

  limit(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }
}
