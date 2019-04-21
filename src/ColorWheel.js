import Background from './layers/Background.js'
import Triangle from './layers/Triangle.js'
import Cursor from './layers/Cursor.js'
import Output from './layers/Output.js'

import Color from './Color.js'
import { on, getPoint } from './utils.js'

import { RAD_30, RAD_60, RAD_90, SIN_60, FULL_ARC, DEG } from './constants.js'

export default class ColorWheel {
  constructor (el, size, callback) {
    let color = new Color(0,1,1);
    
    this.options = {
      vertices: [0,0,0].map(() => ({x: 0, y: 0})),
      cursor: { x: 0, y: 0 },
      hueRad: 0,
      color
    };
    
    this.color = color;
    this.callback = typeof callback == 'function' ? callback : () => {};
    
    let background = new Background(this.options),
        triangle   = new Triangle(this.options),
        cursor     = new Cursor(this.options),
        output     = new Output(el, this.options, background, triangle, cursor);
    
    this.layers = { background, triangle, cursor, output };
    
    this.domElement = this.layers.output.el;
    
    this.setSize(size);
    
    on(this.domElement, 'touchstart mousedown', this.dragStart.bind(this));
  }
  
  setSize (size) {
    this.size = size = +size;
    
    let center = size / 2,
        radius = center,
        
        spectreThickness = radius / 4,
        
        triangleRadius = radius - spectreThickness * 3/4,
        triangleHeight = 1.5 * triangleRadius,
        triangleBorder = radius / 32,
        
        { vertices } = this.options;
    
    vertices[0].x = triangleRadius;
    vertices[1].x = vertices[2].x = -triangleRadius / 2;
    vertices[1].y = triangleRadius * SIN_60;
    vertices[2].y = -vertices[1].y;
    
    let triangleSide = 2 * vertices[1].y;
    
    Object.assign(this.options, {
      size, center, radius,
      spectreThickness,
      triangleRadius, triangleHeight,
      triangleBorder, triangleSide
    });
    
    this.updateCursor();
    this.layers.output.update();
  }
  
  setColor (model, ...val) {
    model = model.toUpperCase();
    
    let method;
    switch (model) {
      case 'HUE': method = 'setHue'; break;
      case 'NAME': method = 'setName'; break;
      default: method = 'set' + model; break;
    }
    
    if (this.color[method]) {
      this.color[method](...val);
      
      this.options.hueRad = this.color.HSV[0] * DEG;
      this.updateCursor();
      
      if (model != 'SV') this.layers.triangle.render();
      this.layers.cursor.render();
      this.layers.output.render();
      
      this.callback.call(this, 3, method);
    } else throw new TypeError('ColorWheel: Unsupported color model (' + model + ')');
  }
  
  
  updateCursor () {
    let { HSV } = this.color,
        { cursor, vertices, triangleHeight, triangleSide } = this.options;
    
    if (HSV[1]) {
      let saturationRad = HSV[1] * RAD_60,
          radius        = HSV[2] * triangleHeight / Math.cos(saturationRad - RAD_30),
          angle         = RAD_90 - saturationRad;
      
      cursor.x =  radius * Math.cos(angle) + vertices[2].x;
      cursor.y = -radius * Math.sin(angle) - vertices[2].y;
    } else {
      cursor.x = vertices[1].x;
      cursor.y = vertices[1].y - HSV[2] * triangleSide;
    }
  }
  
  relate (point) {
    let rect = this.domElement.getBoundingClientRect(),
        { center } = this.options;
    
    point.x =  point.x - rect.left - center;
    point.y = -point.y + rect.top  + center;
    
    return point;
  }
  
  getHandler (point) {
    let cursorDistance = Math.hypot(point.x, point.y),
        { triangleRadius, radius } = this.options,
        handler;
    
    // Spectre wheel
    if (cursorDistance >= triangleRadius && cursorDistance <= radius) handler = this.rotateWheel;
    // Triangle
    else if (this.moveCursor(point, true)) handler = this.moveCursor;
    
    if (handler) return [ handler.name, handler.bind(this) ];
    else return [ undefined, undefined ];
  }
  
  rotateWheel (point) {
    let { x, y } = point,
        hueRad = Math.acos(x / Math.hypot(x, y));
    
    if (y < 0) hueRad = FULL_ARC - hueRad;
    
    this.options.hueRad = hueRad;
    
    this.color.setHue(Math.round(hueRad / DEG));
    
    this.layers.triangle.render();
    this.layers.cursor.render();
    this.layers.output.render();
  }
  
  moveCursor (point, start) {
    let { x, y } = point,
        { hueRad, vertices, triangleSide, triangleHeight } = this.options,
        cursorDistance = Math.hypot(x, y),
        s, v;
    
    if (hueRad != 0) {
      let cursorAngle = Math.acos(x / cursorDistance);
      
      if (y < 0) cursorAngle = FULL_ARC - cursorAngle;
      
      let rotation = cursorAngle - hueRad;
      
      x = cursorDistance * Math.cos(rotation);
      y = cursorDistance * Math.sin(rotation);
    }
    
    let relativeX     =  x - vertices[1].x,
        saturationY   =  y - vertices[2].y,
        brightnessY   = -y + vertices[1].y,
        saturationHypot = Math.hypot(relativeX, saturationY),
        brightnessHypot = Math.hypot(relativeX, brightnessY),
        saturationCos = saturationY / saturationHypot,
        brightnessCos = brightnessY / Math.hypot(relativeX, brightnessY);
    
    if (start) return saturationCos >= 0.5 && saturationCos <= 1 && brightnessCos >= 0.5 && brightnessCos <= 1 && relativeX >= 0;
    
    if (relativeX < 0) {
      s = 0;
      v = saturationY / triangleSide;
    } else {
      let saturationRad = Math.acos(saturationCos),
          brightnessRad = Math.acos(brightnessCos);
      
      if (brightnessRad > RAD_60 && brightnessRad % RAD_30) s = brightnessHypot * Math.cos(brightnessRad - RAD_60) / triangleSide;
      else s = saturationRad / RAD_60;
      
      if (saturationRad > RAD_60 && saturationRad % RAD_30) v = saturationHypot * Math.cos(saturationRad - RAD_60) / triangleSide;
      else v = saturationHypot * Math.cos(saturationRad - RAD_30) / triangleHeight;
    }
    
    this.color.setSV(s,v);
    
    this.updateCursor();
    this.layers.cursor.render();
    this.layers.output.render();
  }
  
  dragStart (e) {
    if ('button' in e && e.button !== 0) return;
    
    let point   = this.relate(getPoint(e)),
        [ name, handler ] = this.getHandler(point);
    
    if (!handler) return;
    
    e.preventDefault();
    
    handler(point);
    
    this.callback.call(this, 0, name);
    
    let { body } = document,
        
        touch = !!e.changedTouches,
        move   = touch ? 'touchmove'   : 'mousemove',
        end    = touch ? 'touchend'    : 'mouseup',
        cancel = touch ? 'touchcancel' : 'mouseleave';
    
    let moveHandler = e => {
      handler(this.relate(getPoint(e)));
      this.callback.call(this, 1, name);
    };
    
    let removeHandlers = () => {
      body.removeEventListener(move, moveHandler);
      body.removeEventListener(end, removeHandlers);
      body.removeEventListener(cancel, removeHandlers);
      this.callback.call(this, 2, name);
    };
    
    body.addEventListener(move, moveHandler);
    body.addEventListener(end, removeHandlers);
    body.addEventListener(cancel, removeHandlers);
  }
}
