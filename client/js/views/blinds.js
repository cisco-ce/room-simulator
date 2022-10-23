import perspective from 'perspective-transform';

function makePolygon(parent, x, y, w, h) {
  return parent.polygon(x, y, x + w, y, x + w, y + h, x, y + h);
}

const BEAM_WIDTH = 600;
const BEAM_HEIGHT = 160;

/**
 * Illustrated window with blinds (tilted), with perspective transformation
 *
 * windowPolygon coords are top left, top right, bottom right, bottom left
 * Strategy is to compute a normalized, flat window, then transform
 * the perspective when drawing it.
 */
export default class Blinds {
  constructor(
    snap,
    windowElement,
    windowPolygon,
    facesWest,
    numberOfShades = 10,
  ) {
    this.snap = snap;
    this.windowPolygon = windowPolygon;
    this.facesWest = facesWest;
    this.windowElement = windowElement;

    const beamGradient =
      'l(0,0,0.7,0)rgba(255, 255, 255, 0.35)-rgba(255, 255, 255, 0)';
    this.beamFill = this.snap.gradient(beamGradient);
    const beamGradientWeak =
      'l(0,0,0.7,0)rgba(255, 255, 255, 0.15)-rgba(255, 255, 255, 0)';
    this.beamFillWeak = this.snap.gradient(beamGradientWeak);

    this.numberOfShades = numberOfShades;
    this.createBlinds(windowElement, numberOfShades);

    // The normalized window frame is put at 0, 0
    // with height and width set to 100
    const normalizedFrame = [0, 0, 100, 0, 100, 100, 0, 100];
    this.perspectiveHelper = perspective(normalizedFrame, windowPolygon);

    this.bottomBeam = this.beams.polygon().attr({ fill: this.beamFill });
    this.blindPositions = [];
  }

  createBlinds(windowElement, numberOfShades) {
    const windowGradient = this.snap.gradient('l(0, 0, 0, 2)#fafafa-#f1f1f1)');
    // this background will be the fill of the blinds
    windowElement.polygon(this.windowPolygon).attr({ fill: windowGradient });

    this.outsideMask = windowElement.group();
    this.outsideMask
      .polygon(this.windowPolygon)
      .attr({ fill: 'white', stroke: 'black' });

    this.blinds = [];
    this.beams = windowElement.group().addClass('beams');
    for (let i = 0; i < numberOfShades; i += 1) {
      const blind = makePolygon(this.outsideMask, 0, 0, 0, 0);
      blind.attr({ fill: 'black', stroke: 'black' });
      this.blinds.push(blind);

      this.beams
        .polygon()
        .addClass('windowBeam')
        .attr({ fill: this.beamFillWeak });
    }
  }

  /*
   * TODO
   * - different shade on blinds when rotated to other side
   */

  drawBlinds(position, tilt) {
    // redefine 10% as the top, at this points the blinds are all folded
    const pos = position * 0.9 + 10;

    for (let i = 0; i < this.blinds.length; i += 1) {
      const polygon = this.calculateBlind(i, pos, tilt);
      const points = polygon.join(',');
      this.blinds[i].attr('points', points);
      this.blindPositions[i] = polygon;
    }

    this.drawLightBeam();
    this.drawBeams(tilt);
    this.bottomBeam.attr('display', position > 99.5 ? 'none' : 'block');
  }

  calculateBlind(blindIndex, position, tilt) {
    const x = 0;
    const x2 = 100;
    const offset = 100 - position;
    const blindHeight = 100 / this.numberOfShades;
    let y = -offset + blindIndex * blindHeight;
    let y2 = y + blindHeight;

    // reduce the blind height if it is rotated due to tilting (0 & 100 is closed, 50 is wide open)
    const heightReductionFraction = (2 * (50 - Math.abs(50 - tilt))) / 100;
    y += (heightReductionFraction * blindHeight) / 2;
    y2 -= (heightReductionFraction * blindHeight) / 2;

    // tiny bit of gap btw each blind
    const gap = 0.5;
    y += gap;

    // if the blind is near the top, fold it
    y = Math.max(y, blindIndex);
    y2 = Math.max(y2, y + 0.7);

    const points = [x, y, x2, y, x2, y2, x, y2];
    return this.makePerspective(points);

    // TODO: support rotating the blinds again
    // const rowHeight = 2 * Math.abs(50 - tilt) * h / 100;
    // const rotationOffset = (h - rowHeight) / 2;
    // const gap = 0.5; // gap between each tile at closed position
  }

  makePerspective(points) {
    let list = [];
    for (let i = 0; i < points.length; i += 2) {
      const newPoint = this.perspectiveHelper.transform(
        points[i],
        points[i + 1],
      );
      list = list.concat(newPoint);
    }
    return list;
  }

  getOutsideMask() {
    return this.outsideMask;
  }

  drawLightBeam() {
    const lastBlind = this.blinds[this.blinds.length - 1].attr('points');
    const x1 = lastBlind[6]; // bottom of last blind
    const y1 = lastBlind[7];
    const x2 = lastBlind[4];
    const y2 = lastBlind[5];
    const x3 = parseInt(x2, 10) + BEAM_WIDTH;
    const y3 = parseInt(y2, 10) + BEAM_HEIGHT;
    const x5 = this.windowPolygon[6]; // bottom of window
    const y5 = this.windowPolygon[7];
    const x4 = x3;
    const y4 = y5 + BEAM_HEIGHT;
    const points = [x1, y1, x2, y2, x3, y3, x4, y4, x5, y5].join(',');
    this.bottomBeam.attr({ points });
  }

  // i wish i never did this shit. so does my wife
  drawBeams() {
    const beams = this.beams.selectAll('polygon');
    for (let i = 0; i < beams.length - 2; i += 1) {
      const beam = beams[i];
      const blind = this.blindPositions[i];
      const next = this.blindPositions[i + 1];
      const x1 = blind[6];
      const y1 = blind[7];
      const x2 = blind[4];
      const y2 = blind[5];
      const x3 = x2 + BEAM_WIDTH;
      const y3 = y2 + BEAM_HEIGHT;
      const x5 = next[0];
      const y5 = next[1];
      const x4 = x3 - (x2 - x1);
      const y4 = y5 + BEAM_HEIGHT;
      const p = [x1, y1, x2, y2, x3, y3, x4, y4, x5, y5];
      const isAlmostClosed = Math.abs(y5 - y1) < 8;
      beam.attr('points', isAlmostClosed ? '' : p.join(','));
    }
  }

  getBeams() {
    return this.beams;
  }

  setTilt(tilt) {
    this.tilt = tilt;
  }

  setBlindPosition(percent) {
    this.drawBlinds(percent, this.tilt);
  }
}
