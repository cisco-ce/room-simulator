export default class RoomLightAmbience {
  constructor(element) {
    this.element = element;
    element.style.display = 'inline';
    this.darkness = 0;
    this.lampLight = 0;
    this.naturalLightPercent = 100;
    this.corridorLightPercent = 100;
  }

  setNaturalLight(naturalLightPercent) {
    this.naturalLightPercent = naturalLightPercent;
    this.update();
  }

  setCorridorLight(lightPercent) {
    this.corridorLightPercent = lightPercent;
    this.update();
  }

  setLampLight(percent) {
    this.lampLight = percent;
    this.update();
  }

  update() {
    const maxBlack = 0.85;

    // we scale each light source, so they alone cannot  make full light
    const lampLight = this.lampLight * 0.7;
    const naturalLight = this.naturalLightPercent * 0.7;
    const corridorLight = this.corridorLightPercent * 0.2;

    const totalLight = Math.min(100, lampLight + naturalLight + corridorLight);
    const darkness = (maxBlack * (100 - totalLight)) / 100;
    this.element.style.opacity = darkness;

    this.darkness = darkness;
  }

  getDarkness() {
    return this.darkness;
  }
}