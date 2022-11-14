function trs(x, y, scale = 1) {
  return { transform: `translate(${x}, ${y}) scale(${scale})` };
}

export default class Drone {
  constructor(root) {
    this.root = root;
    this.droneAndLoad = this.root.group().attr('id', 'drone');
    this.ready = false;
  }

  init() {
    // for performance, we dont load bitmaps before we have to
    this.ready = true;
    const imgDrone = './images/drone.png';
    const imgLoad = './images/coke.png';

    this.payload = this.droneAndLoad.image(imgLoad, 35, 45, 25, 45);
    this.drone = this.droneAndLoad.image(imgDrone, 0, 0, 100, 50);

    this.rotorX1 = 5;
    this.rotorX2 = 93;
    const style = { fill: 'black', fillOpacity: 0.8 };
    this.rotor1 = this.droneAndLoad.rect(this.rotorX1, 0, 1, 1).attr(style);
    this.rotor2 = this.droneAndLoad.rect(this.rotorX2, 0, 1, 1).attr(style);

    this.startX = -350;
    this.startY = 250;
    this.startScale = 2;
    this.droneAndLoad.attr(trs(this.startX, this.startY, this.startScale));
    this.hasDelivered = false;
    this.isFlying = false;
  }

  // recursive call to animate rotations, since Snap doesn't support animation loops
  rotateRotor(element, xCenter, width) {
    if (!this.isFlying) return; // stops the animations

    element.animate({ width, x: xCenter - width / 2 }, 40, () => {
      const nextW = width < 10 ? 70 : 0;
      this.rotateRotor(element, xCenter, nextW);
    });
  }

  justDoIt() {
    if (!this.ready) this.init();

    if (this.hasDelivered) return;
    this.hasDelivered = true;
    this.deliver(500, 520);
  }

  cleanUp() {
    if (this.hasDelivered) {
      this.hasDelivered = false;
      this.deliver(500, 520, false);
    }
  }

  deliver(x, y, drop = true) {
    this.isFlying = true;
    const rotorWidth = 70;
    this.rotateRotor(this.rotor1, this.rotorX1, rotorWidth);
    this.rotateRotor(this.rotor2, this.rotorX2, rotorWidth);

    let t = 0;
    this.move(x, this.startY + 100, (t += 4000)); // move drone in
    setTimeout(() => this.move(x, y, 2000), (t += 300)); // move drone down
    setTimeout(() => {
      if (drop) {
        this.root.append(this.payload.attr(trs(x, y))); // detach payload
      } else {
        this.droneAndLoad.prepend(this.payload.attr(trs(0, 0))); // reattach payload
      }
      this.move(x, this.startY + 100, 2000); // move drone up
    }, (t += 3000));
    setTimeout(() => {
      this.move(this.startX, this.startY, 2000, this.startScale);
      setTimeout(() => {
        this.isFlying = false;
      }, 2000);
    }, (t += 2500));
  }

  move(x, y, time, scale) {
    // TODO make own quad in/out
    const ease = window.mina.easeinout;
    this.droneAndLoad.animate(trs(x, y, scale), time, ease);
  }
}