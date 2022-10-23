import perspective from 'perspective-transform';

export default class Canvas {
  constructor(element, canvasPolygon) {
    this.position = 0;

    const normalizedFrame = [0, 0, 100, 0, 100, 100, 0, 100];
    this.perspectiveHelper = perspective(normalizedFrame, canvasPolygon);
    this.shadow = element.polygon().attr({ fill: '#CCC', fillOpacity: 0.9 });
    this.canvas = element.polygon().attr('fill', 'white');

    // for making projection hardly visible when not on canvas
    this.projectionMask = element.group();
    this.projectionMask
      .polygon(canvasPolygon)
      .attr({ fill: 'white', fillOpacity: 0.2 });
    this.canvasMask = this.projectionMask.polygon().attr({ fill: 'white' });

    // for showing world outside window
    // this.outsideMask = element.group();
    // this.outsideMask.polygon(windowsPolygon).attr({ fill: 'white' });
    // this.windowMask = this.outsideMask.polygon().attr({ fill: 'black' });
  }

  getMask() {
    return this.projectionMask;
  }

  getLightPercent() {
    const belowWindow = 33;
    if (this.position < belowWindow) return 100;
    return ((100 - this.position) * 100) / (100 - belowWindow);
  }

  setPosition(canvasPos) {
    this.position = canvasPos;
    const min = 5;
    const pos = min + (canvasPos * (100 - min)) / 100;
    const y = pos;
    const p1 = this.perspectiveHelper.transform(0, 0);
    const p2 = this.perspectiveHelper.transform(100, 0);
    const p3 = this.perspectiveHelper.transform(100, y);
    const p4 = this.perspectiveHelper.transform(0, y);
    const points = [].concat(p1, p2, p3, p4);
    this.canvas.attr({ points });
    this.canvasMask.attr({ points });
    // this.windowMask.attr({ points });
    this.updateShadow(points);
  }

  updateShadow(canvasPoints) {
    const points = [1294, 110, 1319, 99];
    const dx = 26;
    const dy = -13;
    points.push(canvasPoints[4] + dx);
    points.push(canvasPoints[5] + dy);
    points.push(canvasPoints[6] + dx);
    points.push(canvasPoints[7] + dy);
    this.shadow.attr({ points });
  }
}
