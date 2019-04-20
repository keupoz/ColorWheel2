import Layer from './Layer.js'

import { SIN_60, SATURATION_GRADIENT_Y_MULTIPLIER } from '../constants.js'

export default class Triangle extends Layer {
  constructor (options) {
    super(null, null, options);
  }
  
  update () {
    let { vertices, triangleRadius } = this.options;
    
    let saturationGradient = this.ctx.createLinearGradient(vertices[2].x, vertices[2].y, triangleRadius / 4, triangleRadius * SATURATION_GRADIENT_Y_MULTIPLIER),
        brightnessGradient = this.ctx.createLinearGradient(vertices[1].x, vertices[0].y, vertices[0].x, vertices[0].y);
    
		saturationGradient.addColorStop(0, 'white');
		saturationGradient.addColorStop(1, 'rgba(255,255,255,0)');

		brightnessGradient.addColorStop(0, 'black');
		brightnessGradient.addColorStop(1, 'transparent');
		
		this.brightnessGradient = brightnessGradient;
		this.saturationGradient = saturationGradient;
		
    super.update();
  }
  
  renderFn () {
    let { brightnessGradient, saturationGradient } = this,
        { color: { HSL }, hueRad, vertices, triangleBorder } = this.options;
    
    this.center();
    this.ctx.rotate(-hueRad);
    
    // Triangle shape
    this.path(function () {
      this.ctx.moveTo(vertices[0].x, vertices[0].y);
      this.ctx.lineTo(vertices[1].x, vertices[1].y);
      this.ctx.lineTo(vertices[2].x, vertices[2].y);
    });
    
    // Hue filling
    this.ctx.fillStyle = `hsl(${HSL[0]},100%,50%)`;
    this.ctx.fill();
    
    // Saturation and brightness filling
    this.ctx.fillStyle = brightnessGradient;
    this.ctx.fill();
    
    this.safe(function () {
      this.ctx.globalCompositeOperation = 'lighter';
      this.ctx.fillStyle = saturationGradient;
      this.ctx.fill();
    });
    
    // Stroke triangle
    this.ctx.strokeStyle = 'whitesmoke';
    this.ctx.lineWidth = triangleBorder;
    this.ctx.stroke();
  }
}
