import $ from 'jquery';

export default class HVAC {
  constructor(model) {
    this.model = model;
    $('#coolfx-HVAC, #heatfx-HVAC')
      .show()
      .css('opacity', 0);
    this.model.addListener(this.update.bind(this));
  }

  update() {
    // console.log('setpoint', this.model.getSetpoint(), 'actual', this.model.getActual(),
    //  'effect', this.model.currentEffect());
    const effect = this.model.currentEffect();
    if (effect > 0) {
      $('#coolfx-HVAC').css('opacity', 0);
      $('#heatfx-HVAC').css('opacity', effect / 100);
    } else {
      $('#coolfx-HVAC').css('opacity', -effect / 100);
      $('#heatfx-HVAC').css('opacity', 0);
    }
  }
}