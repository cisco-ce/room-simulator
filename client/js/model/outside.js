import Model from './model';

export default class Outside extends Model {
  constructor() {
    super();
    this.outsideId = 'city';
  }

  setOutside(id) {
    this.outsideId = id;
    this.notify();
  }

  getId() {
    return this.outsideId;
  }
}
