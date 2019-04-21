import { clamp1, clamp360, sv2sl, sl2sv } from './utils.js'
import COLORS from './csscolors.json'

const NAMES = {};

Object.keys(COLORS).forEach(name => {
  NAMES[COLORS[name]] = name;
});

export default class Color {
  constructor (h,s,v) {
    this.HSV = [ 0,0,0 ];
    this.HSL = [ 0,0,0 ];
    this.RGB = [ 0,0,0 ];
    
    this.setHSV(h,s,v);
  }
  
  isDark () {
    let { RGB } = this;
    return 0.299 * RGB[0] + 0.587 * RGB[1] + 0.114 * RGB[2] <= 127.5;
  }
  
  getName () {
    return NAMES[this.hex] || this.hex;
  }
  
  
  setHSV (h,s,v) {
    this.HSV[0] = clamp360(h);
    this.HSV[1] = clamp1(s);
    this.HSV[2] = clamp1(v);
    
    this.updateHSL();
    this.updateCSS();
    this.updateRGB();
    this.updateNUM();
    this.updateHEX();
  }
  
  setHSL (h,s,l) {
    this.HSL[0] = clamp360(h);
    this.HSL[1] = clamp1(s);
    this.HSL[2] = clamp1(l);
    
    this.updateHSV();
    this.updateCSS();
    this.updateRGB();
    this.updateNUM();
    this.updateHEX();
  }
  
  setRGB (r,g,b) {
    this.RGB[0] = r & 0xff;
    this.RGB[1] = g & 0xff;
    this.RGB[2] = b & 0xff;
    
    this.updateHSVfromRGB();
    this.updateHSL();
    this.updateCSS();
    this.updateNUM();
    this.updateHEX();
  }
  
  setHEX (hex) {
    hex = parseInt(hex.replace('#', ''), 16);
    
    if (isNaN(hex)) throw new TypeError('Color: invalid hex code');
    
    this.setNUM(hex);
  }
  
  setName (name) {
    name = name.replace(/\s+/g, '').toLowerCase();
    if (name in COLORS) this.setHEX(COLORS[name]);
    else this.setHEX(name);
  }
  
  setNUM (num) {
    this.num = num & 0xffffff;
    
    this.updateHEX();
    this.updateRGBfromNUM();
    this.updateHSVfromRGB();
    this.updateHSL();
    this.updateCSS();
  }
  
  setHue (hue) {
    this.HSV[0] = this.HSL[0] = clamp360(hue);
    
    this.updateCSS();
    this.updateRGB();
    this.updateNUM();
    this.updateHEX();
  }
  
  setSV (s,v) {
    this.setHSV(this.HSV[0], s,v);
  }
  
  updateHSV () {
    let [ h, sl, v ] = this.HSL,
        [ sv, l ] = sv2sl(sl,l);
    
    this.HSV[0] = h;
    this.HSV[1] = sv;
    this.HSV[2] = v;
  }
  
  updateHSVfromRGB () {
    let { RGB, HSV } = this,
        [ r,g,b ] = RGB,
        min = Math.min(r,g,b),
        max = Math.max(r,g,b),
        diff = max - min;
    
    if (max !== min) switch (max) {
      case r: HSV[0] = 60 * (g - b) / diff + (g < b ? 360 : 0); break;
      case g: HSV[0] = 60 * (b - r) / diff + 120; break;
      case b: HSV[0] = 60 * (r - g) / diff + 240; break;
    }
    
    HSV[1] = max == 0 ? 0 : 1 - min / max;
    HSV[2] = max / 0xff;
  }
  
  updateHSL () {
    let [ h, sv, v ] = this.HSV,
        [ sl, l ] = sv2sl(sv,v);
    
    this.HSL[0] = h;
    this.HSL[1] = sl;
    this.HSL[2] = l;
  }
  
  updateCSS () {
    let [ h,s,l ] = this.HSL;
    this.css = `hsl(${ h },${ s * 100 }%,${ l * 100 }%)`;
  }
  
  // https://gist.github.com/mjackson/5311256
  updateRGB () {
    let { RGB, HSV } = this,
        [ h,s,v ] = HSV,
        h1 = Math.floor((h / 60) % 6),
        vmin = (1 - s) * v,
        a = (v - vmin) * (h % 60) / 60,
        vinc = vmin + a,
        vdec = v - a,
        
        c = [ [v,vinc,vmin], [vdec,v,vmin], [vmin,v,vinc], [vmin,vdec,v], [vinc,vmin,v], [v,vmin,vdec] ];
    
    c[h1].forEach((val,i) => RGB[i] = (val * 0xff) & 0xff);
  }
  
  updateRGBfromNUM () {
    let { RGB, num } = this;
    
    RGB[0] = num >> 16;
    RGB[1] = num >> 8 & 0xff;
    RGB[2] = num & 0xff;
  }
  
  updateNUM () {
    let [ r,g,b ] = this.RGB;
    
    this.num = (r << 16) + (g << 8) + b;
  }
  
  updateHEX () {
    this.hex = '#' + this.num.toString(16).padStart(6, '0');
  }
}
