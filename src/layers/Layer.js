export default class Layer {
  constructor (el, ctx, options) {
    this.options = options;
    
    this.el = el || document.createElement('canvas');
    this.ctx = ctx || this.el.getContext('2d');
  }
  
  setSize (size) {
    this.el.width = this.el.height = size;
  }
  
  update () {
    this.setSize(this.options.size);
    this.render();
  }
  
  safe (cb) {
    this.ctx.save();
    cb.call(this);
    this.ctx.restore();
  }
  
  path (cb) {
    this.ctx.beginPath();
    cb.call(this);
    this.ctx.closePath();
  }
  
  clear () {
    let { size } = this.options;
    
    this.ctx.clearRect(0,0, size, size);
  }
  
  center () {
    let { center } = this.options;
    
    this.ctx.translate(center, center);
  }
  
  renderFn () {}
  
  render () {
    this.clear();
    this.safe(this.renderFn);
  }
}
