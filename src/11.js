const _interpolatedPointsPerSegment = 25;
export const getInterpolatedPoints = (_points) => {
  let pnts = null;
  let pnt = null;
  let pnt0 = null;
  let pnt1 = null;
  let pnt2 = null;
  let pnt3 = null;
  let ipps = _interpolatedPointsPerSegment - 1;
  let subsegments = ipps * (_points.length - 1) + 1;
  let n = 0;
  let current_base = 0;
  let rv = null;
  if (_points.length > 2) {
    rv = [];
    for (let i = 0; i < subsegments; ++i) {
      rv.push({ x: 0.0, y: 0.0 });
    }
    pnts = _points;
    pnt1 = pnts[0];
    pnt2 = pnts[1];
    pnt3 = pnts[2];
    pnt0 = pnt = { x: pnt1.x + (pnt1.x - pnt2.x), y: pnt1.y + (pnt1.y - pnt2.y) };
    _getSegment(pnt0, pnt1, pnt2, pnt3, rv, current_base);
    current_base += ipps;
    n = pnts.length;
    for (let i = 3; i < n; ++i) {
      pnt0 = pnt1;
      pnt1 = pnt2;
      pnt2 = pnt3;
      pnt3 = pnts[i];
      _getSegment(pnt0, pnt1, pnt2, pnt3, rv, current_base);
      current_base += ipps;
    }
    pnt0 = pnt1;
    pnt1 = pnt2;
    pnt2 = pnt3;
    pnt3 = pnt;
    pnt3.x = pnt2.x + (pnt2.x - pnt1.x);
    pnt3.y = pnt2.y + (pnt2.y - pnt1.y);
    _getSegment(pnt0, pnt1, pnt2, pnt3, rv, current_base);
    current_base += ipps;
    void 0;
  } else if (!(rv && _points.length > 2)) {
    rv = [];
    pnts = _points;
    n = pnts.length;
    for (let i = 0; i < n; ++i) {
      pnt = pnts[i];
      rv.push({ x: pnt.x, y: pnt.y });
    }
    void 0;
  }
  pnt = pnts = pnt0 = pnt1 = pnt2 = pnt3 = null;
  return rv;
};
const _getSegment = (pnt0, pnt1, pnt2d, pnt3, buff, buff_base) => {
  let rv = false;
  let steps = 0;
  let step = 0.0;
  let t = 0.0;
  let tt = 0.0;
  let ttt = 0.0;
  let p0x = pnt0.x;
  let p1x = pnt1.x;
  let p2x = pnt2.x;
  let p3x = pnt3.x;
  let p0y = pnt0.y;
  let p1y = pnt1.y;
  let p2y = pnt2.y;
  let p3y = pnt3.y;
  let ipps = _interpolatedPointsPerSegment;
  let i = 0;
  if (buff) {
    steps = ipps - 1;
    if (steps > 0) {
      step = 1.0 / steps;
      steps = buff_base + steps;
      buff[buff_base].x = pnt1.x;
      buff[buff_base].y = pnt1.y;
      for (i = buff_base + 1; i < steps; ++i) {
        t += step;
        tt = t * t;
        ttt = tt * t;
        buff[i].x =
          0.5 *
          (2 * p1x +
            (-p0x + p2x) * t +
            (2 * p0x - 5 * p1x + 4 * p2x - p3x) * tt +
            (-p0x + 3 * p1x - 3 * p2x + p3x) * ttt);
        buff[i].y =
          0.5 *
          (2 * p1y +
            (-p0y + p2y) * t +
            (2 * p0y - 5 * p1y + 4 * p2y - p3y) * tt +
            (-p0y + 3 * p1y - 3 * p2y + p3y) * ttt);
      }
      buff[steps].x = pnt2.x;
      buff[steps].y = pnt2.y;
      rv = true;
    }
  }
  return rv;
};

// сложность по нашей формуле 14.07
// сложность по плагину Codemetrics 13
// сложность по мнению Plato 85
// сложность по мнению Потапова 40-50
// сложность по мнению Потапова 50
// когнитивная сложность по sonarCude 15
// цикломаттческая сложность по sonarCube 11
