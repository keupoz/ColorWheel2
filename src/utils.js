function clamp (min, max, number) {
  return Math.max(min, Math.min(number, max));
}

export function clamp1 (number) {
  return clamp(0,1, number);
}

export function clamp360 (deg) {
  deg -= 360 * (deg / 360 | 0);
  if (deg < 0) deg += 360;
  return Math.round(deg);
}

export function sv2sl (s,v) {
  let a = (2 - s) * v;
  
  s = s * v / (a <= 1 ? a : 2 - a) || 0;
  v = a / 2;
  
  return [ s, v ];
}

export function sl2sv (s,l) {
  s *= l < 0.5 ? l : 1 - l;
  
  l += s;
  s = 2 * s / l;
  
  return [ s,l ];
}

export function on (el, events, handler) {
  events.split(' ').forEach(event => el.addEventListener(event, handler));
}

export function getPoint (e) {
  let { clientX: x, clientY: y } = e.changedTouches ? e.changedTouches[0] : e;
  return { x, y };
}
