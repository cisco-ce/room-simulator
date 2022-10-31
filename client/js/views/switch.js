export default class Switch {
  constructor(snap, x, y, w, h, id, hasSound = true, light = false) {
    if (light) {
      snap
        .rect(x, y, w - 2, 1)
        .addClass('led');
    }

    this.button = snap
      .rect(x, y, w, h)
      .attr({
        fill: 'transparent',
        stroke: '#3339',
        strokeWidth: 0,
      })
      .addClass('clickable');

    if (id) {
      this.button.attr('id', id);
    }

    this.sound = new Audio('./sounds/switch.mp3');
    this.button.node.addEventListener('mousedown', () => {
      if (hasSound) {
        this.sound.play();
      }
    });

  }

  click(listener) {
    this.button.click((e) => {
      listener();
      e.stopImmediatePropagation();
    });
  }

  mousedown(listener) {
    this.button.mousedown(listener);
  }

  mouseup(listener) {
    this.button.mouseup(listener);
  }
}