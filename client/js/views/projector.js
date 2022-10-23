import $ from 'jquery';

import Switch from './switch';

export default class Projector {
  constructor(root, projectorModel) {
    const projector = new Switch(root, 631, 148, 100, 50, 'projector-switch');
    projector.click(() => projectorModel.toggle());
    const beam = $('#lightfx-projector_1_');

    console.warn('TODO add presentation image');
    const image = '/images/presentation-canvas.png';
    this.canvasImage = root
      .image(image, 980, 90, 310, 453)
      .attr('id', 'canvasImage');
    beam.add(this.canvasImage); // must be on top of darkness layer
    $('#canvasImage').hide();
    const powerLight = root.select('#lightfx-projector-power');
    projectorModel.addListener(() => {
      if (projectorModel.isOn()) {
        beam.fadeIn(1000);
        $('#canvasImage').fadeIn(1000);
        powerLight.attr('display', 'block');
      } else {
        beam.fadeOut(1000);
        $('#canvasImage').fadeOut(1000);
        powerLight.attr('display', 'none');
      }
    });
  }

  setAmbience(darkness) {
    const opacityInFullLight = 0.07;
    const opacity = Math.max(opacityInFullLight, darkness);
    this.canvasImage.attr('opacity', opacity);
  }
}