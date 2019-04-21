import Layer from './Layer.js'

import { FULL_ARC } from '../constants.js'

export default class Cursor extends Layer {
  constructor (options) {
    super(null, null, options);
  }
  
  renderFn () {
    let { color, hueRad, cursor: {x, y}, triangleBorder } = this.options;
    
    this.center();
    this.ctx.rotate(-hueRad);
    
    this.path(function () {
      this.ctx.arc(x, y, 5, 0, FULL_ARC);
      this.ctx.strokeStyle = 'whitesmoke';
      this.ctx.lineWidth = triangleBorder;
      this.ctx.fillStyle = color.css;
      
      this.ctx.stroke();
      this.ctx.fill();
    });
  }
}
