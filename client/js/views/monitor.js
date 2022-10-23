
export default class Monitor {
  constructor(layer, x, y, w, h) {
    this.image = layer.image('', x, y, w, h).addClass('monitor');
    this.image.node.style.transition = 'opacity 2s';
    this.set(false);
  }

  setImage(url) {
    this.image.attr({ 'xlink:href': url });
  }

  click(listener) {
    return this.image.click(listener);
  }

  toggle() {
    const showing = this.image.attr('opacity') > 0;
    this.set(!showing);
  }

  set(on) {
    this.image.attr('opacity', on ? 1 : 0);
  }
}






