import Layer from './Layer.js'

export default class Output extends Layer {
  constructor (el, options, ...layers) {
    let ctx = null;
    
    if (typeof el == 'string') el = document.querySelector(el);
    
    if (el instanceof CanvasRenderingContext2D) {
      ctx = el;
      el = null;
    } else if (!(el instanceof HTMLCanvasElement)) el = null;
    
    super(el, ctx, options);
    
    this.layers = layers;
  }
  
  update () {
    this.layers.forEach(layer => layer.update());
    super.update();
  }
  
  renderFn () {
    this.layers.forEach(layer => this.ctx.drawImage(layer.el, 0,0));
  }
}
