import Layer from './Layer.js'

import { DEG, FULL_ARC } from '../constants.js'

export default class Background extends Layer {
  constructor (options) {
    super(null, null, options);
  }
  
  renderFn () {
    let { radius, spectreThickness, triangleRadius } = this.options;
    
    this.center();
    
    // Background with center shadow
    this.path(function () {
      this.ctx.arc(0,0, radius, 0, FULL_ARC);
      
      let gradient = this.ctx.createRadialGradient(0,0,0, 0,0,radius);
      
      gradient.addColorStop(0, '#000');
      gradient.addColorStop(1, '#555');
      
      this.ctx.fillStyle = gradient;
      this.ctx.fill();
    });
    
    // Center circle
    this.path(function () {
      this.ctx.arc(0,0, radius - 2 * spectreThickness, 0, FULL_ARC);
      this.ctx.fillStyle = '#444';
      this.ctx.fill();
    });
    
    // Spectre wheel
    let spectreRadius = radius - spectreThickness / 2;
    this.ctx.lineWidth = spectreThickness;
      
    for (let deg = 0; deg < 360; deg++) {
      this.path(function () {
        this.ctx.arc(0,0, spectreRadius, deg * DEG, (deg + 1.5) * DEG);
        this.ctx.strokeStyle = `hsl(${-deg},100%,50%)`;
        this.ctx.stroke();
      });
    }
    
    // Triangle path
    this.path(function () {
      this.ctx.arc(0,0, triangleRadius, 0, FULL_ARC);
      this.ctx.fillStyle = 'rgba(68,68,68,0.25)';
      this.ctx.fill();
    });
  }
}
