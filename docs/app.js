(function () {
  'use strict';

  var Layer = function Layer (el, ctx, options) {
    this.options = options;
      
    this.el = el || document.createElement('canvas');
    this.ctx = ctx || this.el.getContext('2d');
  };
    
  Layer.prototype.setSize = function setSize (size) {
    this.el.width = this.el.height = size;
  };
    
  Layer.prototype.update = function update () {
    this.setSize(this.options.size);
    this.render();
  };
    
  Layer.prototype.safe = function safe (cb) {
    this.ctx.save();
    cb.call(this);
    this.ctx.restore();
  };
    
  Layer.prototype.path = function path (cb) {
    this.ctx.beginPath();
    cb.call(this);
    this.ctx.closePath();
  };
    
  Layer.prototype.clear = function clear () {
    var ref = this.options;
      var size = ref.size;
      
    this.ctx.clearRect(0,0, size, size);
  };
    
  Layer.prototype.center = function center () {
    var ref = this.options;
      var center = ref.center;
      
    this.ctx.translate(center, center);
  };
    
  Layer.prototype.renderFn = function renderFn () {};
    
  Layer.prototype.render = function render () {
    this.clear();
    this.safe(this.renderFn);
  };

  var
  FULL_ARC = Math.PI * 2,
  DEG      = Math.PI / 180,
  RAD_30   = Math.PI / 6,
  RAD_60   = Math.PI / 3,
  RAD_90   = Math.PI / 2,
  SQRT_3   = Math.sqrt(3),
  SIN_60   = SQRT_3 / 2,

  SATURATION_GRADIENT_Y_MULTIPLIER = SQRT_3 / 4;

  var Background = /*@__PURE__*/(function (Layer) {
    function Background (options) {
      Layer.call(this, null, null, options);
    }

    if ( Layer ) { Background.__proto__ = Layer; }
    Background.prototype = Object.create( Layer && Layer.prototype );
    Background.prototype.constructor = Background;
    
    Background.prototype.renderFn = function renderFn () {
      var this$1 = this;

      var ref = this.options;
      var radius = ref.radius;
      var spectreThickness = ref.spectreThickness;
      var triangleRadius = ref.triangleRadius;
      
      this.center();
      
      // Background with center shadow
      this.path(function () {
        this.ctx.arc(0,0, radius, 0, FULL_ARC);
        
        var gradient = this.ctx.createRadialGradient(0,0,0, 0,0,radius);
        
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
      var spectreRadius = radius - spectreThickness / 2;
      this.ctx.lineWidth = spectreThickness;
        
      var loop = function ( deg ) {
        this$1.path(function () {
          this.ctx.arc(0,0, spectreRadius, deg * DEG, (deg + 1.5) * DEG);
          this.ctx.strokeStyle = "hsl(" + (-deg) + ",100%,50%)";
          this.ctx.stroke();
        });
      };

      for (var deg = 0; deg < 360; deg++) { loop( deg ); }
      
      // Triangle path
      this.path(function () {
        this.ctx.arc(0,0, triangleRadius, 0, FULL_ARC);
        this.ctx.fillStyle = 'rgba(68,68,68,0.25)';
        this.ctx.fill();
      });
    };

    return Background;
  }(Layer));

  var Triangle = /*@__PURE__*/(function (Layer) {
    function Triangle (options) {
      Layer.call(this, null, null, options);
    }

    if ( Layer ) { Triangle.__proto__ = Layer; }
    Triangle.prototype = Object.create( Layer && Layer.prototype );
    Triangle.prototype.constructor = Triangle;
    
    Triangle.prototype.update = function update () {
      var ref = this.options;
      var vertices = ref.vertices;
      var triangleRadius = ref.triangleRadius;
      
      var saturationGradient = this.ctx.createLinearGradient(vertices[2].x, vertices[2].y, triangleRadius / 4, triangleRadius * SATURATION_GRADIENT_Y_MULTIPLIER),
          brightnessGradient = this.ctx.createLinearGradient(vertices[1].x, vertices[0].y, vertices[0].x, vertices[0].y);
      
  		saturationGradient.addColorStop(0, 'white');
  		saturationGradient.addColorStop(1, 'rgba(255,255,255,0)');

  		brightnessGradient.addColorStop(0, 'black');
  		brightnessGradient.addColorStop(1, 'transparent');
  		
  		this.brightnessGradient = brightnessGradient;
  		this.saturationGradient = saturationGradient;
  		
      Layer.prototype.update.call(this);
    };
    
    Triangle.prototype.renderFn = function renderFn () {
      var ref = this;
      var brightnessGradient = ref.brightnessGradient;
      var saturationGradient = ref.saturationGradient;
      var ref$1 = this.options;
      var HSL = ref$1.color.HSL;
      var hueRad = ref$1.hueRad;
      var vertices = ref$1.vertices;
      var triangleBorder = ref$1.triangleBorder;
      
      this.center();
      this.ctx.rotate(-hueRad);
      
      // Triangle shape
      this.path(function () {
        this.ctx.moveTo(vertices[0].x, vertices[0].y);
        this.ctx.lineTo(vertices[1].x, vertices[1].y);
        this.ctx.lineTo(vertices[2].x, vertices[2].y);
      });
      
      // Hue filling
      this.ctx.fillStyle = "hsl(" + (HSL[0]) + ",100%,50%)";
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
    };

    return Triangle;
  }(Layer));

  var Cursor = /*@__PURE__*/(function (Layer) {
    function Cursor (options) {
      Layer.call(this, null, null, options);
    }

    if ( Layer ) { Cursor.__proto__ = Layer; }
    Cursor.prototype = Object.create( Layer && Layer.prototype );
    Cursor.prototype.constructor = Cursor;
    
    Cursor.prototype.renderFn = function renderFn () {
      var ref = this.options;
      var color = ref.color;
      var hueRad = ref.hueRad;
      var ref_cursor = ref.cursor;
      var x = ref_cursor.x;
      var y = ref_cursor.y;
      var triangleBorder = ref.triangleBorder;
      
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
    };

    return Cursor;
  }(Layer));

  var Output = /*@__PURE__*/(function (Layer) {
    function Output (el, options) {
      var arguments$1 = arguments;

      var layers = [], len = arguments.length - 2;
      while ( len-- > 0 ) { layers[ len ] = arguments$1[ len + 2 ]; }

      var ctx = null;
      
      if (typeof el == 'string') { el = document.querySelector(el); }
      
      if (el instanceof CanvasRenderingContext2D) {
        ctx = el;
        el = null;
      } else if (!(el instanceof HTMLCanvasElement)) { el = null; }
      
      Layer.call(this, el, ctx, options);
      
      this.layers = layers;
    }

    if ( Layer ) { Output.__proto__ = Layer; }
    Output.prototype = Object.create( Layer && Layer.prototype );
    Output.prototype.constructor = Output;
    
    Output.prototype.update = function update () {
      this.layers.forEach(function (layer) { return layer.update(); });
      Layer.prototype.update.call(this);
    };
    
    Output.prototype.renderFn = function renderFn () {
      var this$1 = this;

      this.layers.forEach(function (layer) { return this$1.ctx.drawImage(layer.el, 0,0); });
    };

    return Output;
  }(Layer));

  function clamp (min, max, number) {
    return Math.max(min, Math.min(number, max));
  }

  function clamp1 (number) {
    return clamp(0,1, number);
  }

  function clamp360 (deg) {
    deg -= 360 * (deg / 360 | 0);
    if (deg < 0) { deg += 360; }
    return Math.round(deg);
  }

  function sv2sl (s,v) {
    var a = (2 - s) * v;
    
    s = s * v / (a <= 1 ? a : 2 - a) || 0;
    v = a / 2;
    
    return [ s, v ];
  }

  function on (el, events, handler) {
    events.split(' ').forEach(function (event) { return el.addEventListener(event, handler); });
  }

  function getPoint (e) {
    var ref = e.changedTouches ? e.changedTouches[0] : e;
    var x = ref.clientX;
    var y = ref.clientY;
    return { x: x, y: y };
  }

  var aliceblue = "#f0f8ff";
  var antiquewhite = "#faebd7";
  var aqua = "#00ffff";
  var aquamarine = "#7fffd4";
  var azure = "#f0ffff";
  var beige = "#f5f5dc";
  var bisque = "#ffe4c4";
  var black = "#000000";
  var blanchedalmond = "#ffebcd";
  var blue = "#0000ff";
  var blueviolet = "#8a2be2";
  var brown = "#a52a2a";
  var burlywood = "#deb887";
  var cadetblue = "#5f9ea0";
  var chartreuse = "#7fff00";
  var chocolate = "#d2691e";
  var coral = "#ff7f50";
  var cornflowerblue = "#6495ed";
  var cornsilk = "#fff8dc";
  var crimson = "#dc143c";
  var cyan = "#00ffff";
  var darkblue = "#00008b";
  var darkcyan = "#008b8b";
  var darkgoldenrod = "#b8860b";
  var darkgray = "#a9a9a9";
  var darkgreen = "#006400";
  var darkgrey = "#a9a9a9";
  var darkkhaki = "#bdb76b";
  var darkmagenta = "#8b008b";
  var darkolivegreen = "#556b2f";
  var darkorange = "#ff8c00";
  var darkorchid = "#9932cc";
  var darkred = "#8b0000";
  var darksalmon = "#e9967a";
  var darkseagreen = "#8fbc8f";
  var darkslateblue = "#483d8b";
  var darkslategray = "#2f4f4f";
  var darkslategrey = "#2f4f4f";
  var darkturquoise = "#00ced1";
  var darkviolet = "#9400d3";
  var deeppink = "#ff1493";
  var deepskyblue = "#00bfff";
  var dimgray = "#696969";
  var dimgrey = "#696969";
  var dodgerblue = "#1e90ff";
  var firebrick = "#b22222";
  var floralwhite = "#fffaf0";
  var forestgreen = "#228b22";
  var fuchsia = "#ff00ff";
  var gainsboro = "#dcdcdc";
  var ghostwhite = "#f8f8ff";
  var goldenrod = "#daa520";
  var gold = "#ffd700";
  var gray = "#808080";
  var green = "#008000";
  var greenyellow = "#adff2f";
  var grey = "#808080";
  var honeydew = "#f0fff0";
  var hotpink = "#ff69b4";
  var indianred = "#cd5c5c";
  var indigo = "#4b0082";
  var ivory = "#fffff0";
  var khaki = "#f0e68c";
  var lavenderblush = "#fff0f5";
  var lavender = "#e6e6fa";
  var lawngreen = "#7cfc00";
  var lemonchiffon = "#fffacd";
  var lightblue = "#add8e6";
  var lightcoral = "#f08080";
  var lightcyan = "#e0ffff";
  var lightgoldenrodyellow = "#fafad2";
  var lightgray = "#d3d3d3";
  var lightgreen = "#90ee90";
  var lightgrey = "#d3d3d3";
  var lightpink = "#ffb6c1";
  var lightsalmon = "#ffa07a";
  var lightseagreen = "#20b2aa";
  var lightskyblue = "#87cefa";
  var lightslategray = "#778899";
  var lightslategrey = "#778899";
  var lightsteelblue = "#b0c4de";
  var lightyellow = "#ffffe0";
  var lime = "#00ff00";
  var limegreen = "#32cd32";
  var linen = "#faf0e6";
  var magenta = "#ff00ff";
  var maroon = "#800000";
  var mediumaquamarine = "#66cdaa";
  var mediumblue = "#0000cd";
  var mediumorchid = "#ba55d3";
  var mediumpurple = "#9370db";
  var mediumseagreen = "#3cb371";
  var mediumslateblue = "#7b68ee";
  var mediumspringgreen = "#00fa9a";
  var mediumturquoise = "#48d1cc";
  var mediumvioletred = "#c71585";
  var midnightblue = "#191970";
  var mintcream = "#f5fffa";
  var mistyrose = "#ffe4e1";
  var moccasin = "#ffe4b5";
  var navajowhite = "#ffdead";
  var navy = "#000080";
  var oldlace = "#fdf5e6";
  var olive = "#808000";
  var olivedrab = "#6b8e23";
  var orange = "#ffa500";
  var orangered = "#ff4500";
  var orchid = "#da70d6";
  var palegoldenrod = "#eee8aa";
  var palegreen = "#98fb98";
  var paleturquoise = "#afeeee";
  var palevioletred = "#db7093";
  var papayawhip = "#ffefd5";
  var peachpuff = "#ffdab9";
  var peru = "#cd853f";
  var pink = "#ffc0cb";
  var plum = "#dda0dd";
  var powderblue = "#b0e0e6";
  var purple = "#800080";
  var rebeccapurple = "#663399";
  var red = "#ff0000";
  var rosybrown = "#bc8f8f";
  var royalblue = "#4169e1";
  var saddlebrown = "#8b4513";
  var salmon = "#fa8072";
  var sandybrown = "#f4a460";
  var seagreen = "#2e8b57";
  var seashell = "#fff5ee";
  var sienna = "#a0522d";
  var silver = "#c0c0c0";
  var skyblue = "#87ceeb";
  var slateblue = "#6a5acd";
  var slategray = "#708090";
  var slategrey = "#708090";
  var snow = "#fffafa";
  var springgreen = "#00ff7f";
  var steelblue = "#4682b4";
  var tan = "#d2b48c";
  var teal = "#008080";
  var thistle = "#d8bfd8";
  var tomato = "#ff6347";
  var turquoise = "#40e0d0";
  var violet = "#ee82ee";
  var wheat = "#f5deb3";
  var white = "#ffffff";
  var whitesmoke = "#f5f5f5";
  var yellow = "#ffff00";
  var yellowgreen = "#9acd32";
  var COLORS = {
  	aliceblue: aliceblue,
  	antiquewhite: antiquewhite,
  	aqua: aqua,
  	aquamarine: aquamarine,
  	azure: azure,
  	beige: beige,
  	bisque: bisque,
  	black: black,
  	blanchedalmond: blanchedalmond,
  	blue: blue,
  	blueviolet: blueviolet,
  	brown: brown,
  	burlywood: burlywood,
  	cadetblue: cadetblue,
  	chartreuse: chartreuse,
  	chocolate: chocolate,
  	coral: coral,
  	cornflowerblue: cornflowerblue,
  	cornsilk: cornsilk,
  	crimson: crimson,
  	cyan: cyan,
  	darkblue: darkblue,
  	darkcyan: darkcyan,
  	darkgoldenrod: darkgoldenrod,
  	darkgray: darkgray,
  	darkgreen: darkgreen,
  	darkgrey: darkgrey,
  	darkkhaki: darkkhaki,
  	darkmagenta: darkmagenta,
  	darkolivegreen: darkolivegreen,
  	darkorange: darkorange,
  	darkorchid: darkorchid,
  	darkred: darkred,
  	darksalmon: darksalmon,
  	darkseagreen: darkseagreen,
  	darkslateblue: darkslateblue,
  	darkslategray: darkslategray,
  	darkslategrey: darkslategrey,
  	darkturquoise: darkturquoise,
  	darkviolet: darkviolet,
  	deeppink: deeppink,
  	deepskyblue: deepskyblue,
  	dimgray: dimgray,
  	dimgrey: dimgrey,
  	dodgerblue: dodgerblue,
  	firebrick: firebrick,
  	floralwhite: floralwhite,
  	forestgreen: forestgreen,
  	fuchsia: fuchsia,
  	gainsboro: gainsboro,
  	ghostwhite: ghostwhite,
  	goldenrod: goldenrod,
  	gold: gold,
  	gray: gray,
  	green: green,
  	greenyellow: greenyellow,
  	grey: grey,
  	honeydew: honeydew,
  	hotpink: hotpink,
  	indianred: indianred,
  	indigo: indigo,
  	ivory: ivory,
  	khaki: khaki,
  	lavenderblush: lavenderblush,
  	lavender: lavender,
  	lawngreen: lawngreen,
  	lemonchiffon: lemonchiffon,
  	lightblue: lightblue,
  	lightcoral: lightcoral,
  	lightcyan: lightcyan,
  	lightgoldenrodyellow: lightgoldenrodyellow,
  	lightgray: lightgray,
  	lightgreen: lightgreen,
  	lightgrey: lightgrey,
  	lightpink: lightpink,
  	lightsalmon: lightsalmon,
  	lightseagreen: lightseagreen,
  	lightskyblue: lightskyblue,
  	lightslategray: lightslategray,
  	lightslategrey: lightslategrey,
  	lightsteelblue: lightsteelblue,
  	lightyellow: lightyellow,
  	lime: lime,
  	limegreen: limegreen,
  	linen: linen,
  	magenta: magenta,
  	maroon: maroon,
  	mediumaquamarine: mediumaquamarine,
  	mediumblue: mediumblue,
  	mediumorchid: mediumorchid,
  	mediumpurple: mediumpurple,
  	mediumseagreen: mediumseagreen,
  	mediumslateblue: mediumslateblue,
  	mediumspringgreen: mediumspringgreen,
  	mediumturquoise: mediumturquoise,
  	mediumvioletred: mediumvioletred,
  	midnightblue: midnightblue,
  	mintcream: mintcream,
  	mistyrose: mistyrose,
  	moccasin: moccasin,
  	navajowhite: navajowhite,
  	navy: navy,
  	oldlace: oldlace,
  	olive: olive,
  	olivedrab: olivedrab,
  	orange: orange,
  	orangered: orangered,
  	orchid: orchid,
  	palegoldenrod: palegoldenrod,
  	palegreen: palegreen,
  	paleturquoise: paleturquoise,
  	palevioletred: palevioletred,
  	papayawhip: papayawhip,
  	peachpuff: peachpuff,
  	peru: peru,
  	pink: pink,
  	plum: plum,
  	powderblue: powderblue,
  	purple: purple,
  	rebeccapurple: rebeccapurple,
  	red: red,
  	rosybrown: rosybrown,
  	royalblue: royalblue,
  	saddlebrown: saddlebrown,
  	salmon: salmon,
  	sandybrown: sandybrown,
  	seagreen: seagreen,
  	seashell: seashell,
  	sienna: sienna,
  	silver: silver,
  	skyblue: skyblue,
  	slateblue: slateblue,
  	slategray: slategray,
  	slategrey: slategrey,
  	snow: snow,
  	springgreen: springgreen,
  	steelblue: steelblue,
  	tan: tan,
  	teal: teal,
  	thistle: thistle,
  	tomato: tomato,
  	turquoise: turquoise,
  	violet: violet,
  	wheat: wheat,
  	white: white,
  	whitesmoke: whitesmoke,
  	yellow: yellow,
  	yellowgreen: yellowgreen
  };

  var NAMES = {};

  Object.keys(COLORS).forEach(function (name) {
    NAMES[COLORS[name]] = name;
  });

  var Color = function Color (h,s,v) {
    this.HSV = [ 0,0,0 ];
    this.HSL = [ 0,0,0 ];
    this.RGB = [ 0,0,0 ];
      
    this.setHSV(h,s,v);
  };
    
  Color.prototype.isDark = function isDark () {
    var ref = this;
      var RGB = ref.RGB;
    return 0.299 * RGB[0] + 0.587 * RGB[1] + 0.114 * RGB[2] <= 127.5;
  };
    
  Color.prototype.getName = function getName () {
    return NAMES[this.hex] || this.hex;
  };
    
    
  Color.prototype.setHSV = function setHSV (h,s,v) {
    this.HSV[0] = clamp360(h);
    this.HSV[1] = clamp1(s);
    this.HSV[2] = clamp1(v);
      
    this.updateHSL();
    this.updateCSS();
    this.updateRGB();
    this.updateNUM();
    this.updateHEX();
  };
    
  Color.prototype.setHSL = function setHSL (h,s,l) {
    this.HSL[0] = clamp360(h);
    this.HSL[1] = clamp1(s);
    this.HSL[2] = clamp1(l);
      
    this.updateHSV();
    this.updateCSS();
    this.updateRGB();
    this.updateNUM();
    this.updateHEX();
  };
    
  Color.prototype.setRGB = function setRGB (r,g,b) {
    this.RGB[0] = r & 0xff;
    this.RGB[1] = g & 0xff;
    this.RGB[2] = b & 0xff;
      
    this.updateHSVfromRGB();
    this.updateHSL();
    this.updateCSS();
    this.updateNUM();
    this.updateHEX();
  };
    
  Color.prototype.setHEX = function setHEX (hex) {
    hex = parseInt(hex.replace('#', ''), 16);
      
    if (isNaN(hex)) { throw new TypeError('Color: invalid hex code'); }
      
    this.setNUM(hex);
  };
    
  Color.prototype.setName = function setName (name) {
    name = name.replace(/\s+/g, '').toLowerCase();
    if (name in COLORS) { this.setHEX(COLORS[name]); }
    else { this.setHEX(name); }
  };
    
  Color.prototype.setNUM = function setNUM (num) {
    this.num = num & 0xffffff;
      
    this.updateHEX();
    this.updateRGBfromNUM();
    this.updateHSVfromRGB();
    this.updateHSL();
    this.updateCSS();
  };
    
  Color.prototype.setHue = function setHue (hue) {
    this.HSV[0] = this.HSL[0] = clamp360(hue);
      
    this.updateCSS();
    this.updateRGB();
    this.updateNUM();
    this.updateHEX();
  };
    
  Color.prototype.setSV = function setSV (s,v) {
    this.setHSV(this.HSV[0], s,v);
  };
    
  Color.prototype.updateHSV = function updateHSV () {
    var ref = this.HSL;
      var h = ref[0];
      var sl = ref[1];
      var v = ref[2];
      var ref$1 = sv2sl(sl,l);
      var sv = ref$1[0];
      var l = ref$1[1];
      
    this.HSV[0] = h;
    this.HSV[1] = sv;
    this.HSV[2] = v;
  };
    
  Color.prototype.updateHSVfromRGB = function updateHSVfromRGB () {
    var ref = this;
      var RGB = ref.RGB;
      var HSV = ref.HSV;
      var r = RGB[0];
      var g = RGB[1];
      var b = RGB[2];
      var min = Math.min(r,g,b),
        max = Math.max(r,g,b),
        diff = max - min;
      
    if (max !== min) { switch (max) {
      case r: HSV[0] = 60 * (g - b) / diff + (g < b ? 360 : 0); break;
      case g: HSV[0] = 60 * (b - r) / diff + 120; break;
      case b: HSV[0] = 60 * (r - g) / diff + 240; break;
    } }
      
    HSV[1] = max == 0 ? 0 : 1 - min / max;
    HSV[2] = max / 0xff;
  };
    
  Color.prototype.updateHSL = function updateHSL () {
    var ref = this.HSV;
      var h = ref[0];
      var sv = ref[1];
      var v = ref[2];
      var ref$1 = sv2sl(sv,v);
      var sl = ref$1[0];
      var l = ref$1[1];
      
    this.HSL[0] = h;
    this.HSL[1] = sl;
    this.HSL[2] = l;
  };
    
  Color.prototype.updateCSS = function updateCSS () {
    var ref = this.HSL;
      var h = ref[0];
      var s = ref[1];
      var l = ref[2];
    this.css = "hsl(" + h + "," + (s * 100) + "%," + (l * 100) + "%)";
  };
    
  // https://gist.github.com/mjackson/5311256
  Color.prototype.updateRGB = function updateRGB () {
    var ref = this;
      var RGB = ref.RGB;
      var HSV = ref.HSV;
      var h = HSV[0];
      var s = HSV[1];
      var v = HSV[2];
      var h1 = Math.floor((h / 60) % 6),
        vmin = (1 - s) * v,
        a = (v - vmin) * (h % 60) / 60,
        vinc = vmin + a,
        vdec = v - a,
          
        c = [ [v,vinc,vmin], [vdec,v,vmin], [vmin,v,vinc], [vmin,vdec,v], [vinc,vmin,v], [v,vmin,vdec] ];
      
    c[h1].forEach(function (val,i) { return RGB[i] = (val * 0xff) & 0xff; });
  };
    
  Color.prototype.updateRGBfromNUM = function updateRGBfromNUM () {
    var ref = this;
      var RGB = ref.RGB;
      var num = ref.num;
      
    RGB[0] = num >> 16;
    RGB[1] = num >> 8 & 0xff;
    RGB[2] = num & 0xff;
  };
    
  Color.prototype.updateNUM = function updateNUM () {
    var ref = this.RGB;
      var r = ref[0];
      var g = ref[1];
      var b = ref[2];
      
    this.num = (r << 16) + (g << 8) + b;
  };
    
  Color.prototype.updateHEX = function updateHEX () {
    this.hex = '#' + this.num.toString(16).padStart(6, '0');
  };

  var ColorWheel = function ColorWheel (el, size, callback) {
    var color = new Color(0,1,1);
      
    this.options = {
      vertices: [0,0,0].map(function () { return ({x: 0, y: 0}); }),
      cursor: { x: 0, y: 0 },
      hueRad: 0,
      color: color
    };
      
    this.color = color;
    this.callback = typeof callback == 'function' ? callback : function () {};
      
    var background = new Background(this.options),
        triangle = new Triangle(this.options),
        cursor   = new Cursor(this.options),
        output   = new Output(el, this.options, background, triangle, cursor);
      
    this.layers = { background: background, triangle: triangle, cursor: cursor, output: output };
      
    this.domElement = this.layers.output.el;
      
    this.setSize(size);
      
    on(this.domElement, 'touchstart mousedown', this.dragStart.bind(this));
  };
    
  ColorWheel.prototype.setSize = function setSize (size) {
    this.size = size = +size;
      
    var center = size / 2,
        radius = center,
          
        spectreThickness = radius / 4,
          
        triangleRadius = radius - spectreThickness * 3/4,
        triangleHeight = 1.5 * triangleRadius,
        triangleBorder = radius / 32;
      var ref = this.options;
      var vertices = ref.vertices;
      
    vertices[0].x = triangleRadius;
    vertices[1].x = vertices[2].x = -triangleRadius / 2;
    vertices[1].y = triangleRadius * SIN_60;
    vertices[2].y = -vertices[1].y;
      
    var triangleSide = 2 * vertices[1].y;
      
    Object.assign(this.options, {
      size: size, center: center, radius: radius,
      spectreThickness: spectreThickness,
      triangleRadius: triangleRadius, triangleHeight: triangleHeight,
      triangleBorder: triangleBorder, triangleSide: triangleSide
    });
      
    this.updateCursor();
    this.layers.output.update();
  };
    
  ColorWheel.prototype.setColor = function setColor (model) {
      var arguments$1 = arguments;

      var ref;

      var val = [], len = arguments.length - 1;
      while ( len-- > 0 ) { val[ len ] = arguments$1[ len + 1 ]; }
    model = model.toUpperCase();
      
    var method;
    switch (model) {
      case 'HUE': method = 'setHue'; break;
      case 'NAME': method = 'setName'; break;
      default: method = 'set' + model; break;
    }
      
    if (this.color[method]) {
      (ref = this.color)[method].apply(ref, val);
        
      this.options.hueRad = this.color.HSV[0] * DEG;
      this.updateCursor();
        
      if (model != 'SV') { this.layers.triangle.render(); }
      this.layers.cursor.render();
      this.layers.output.render();
        
      this.callback.call(this, 3, method);
    } else { throw new TypeError('ColorWheel: Unsupported color model (' + model + ')'); }
  };
    
    
  ColorWheel.prototype.updateCursor = function updateCursor () {
    var ref = this.color;
      var HSV = ref.HSV;
      var ref$1 = this.options;
      var cursor = ref$1.cursor;
      var vertices = ref$1.vertices;
      var triangleHeight = ref$1.triangleHeight;
      var triangleSide = ref$1.triangleSide;
      
    if (HSV[1]) {
      var saturationRad = HSV[1] * RAD_60,
          radius      = HSV[2] * triangleHeight / Math.cos(saturationRad - RAD_30),
          angle       = RAD_90 - saturationRad;
        
      cursor.x =radius * Math.cos(angle) + vertices[2].x;
      cursor.y = -radius * Math.sin(angle) - vertices[2].y;
    } else {
      cursor.x = vertices[1].x;
      cursor.y = vertices[1].y - HSV[2] * triangleSide;
    }
  };
    
  ColorWheel.prototype.relate = function relate (point) {
    var rect = this.domElement.getBoundingClientRect();
      var ref = this.options;
      var center = ref.center;
      
    point.x =point.x - rect.left - center;
    point.y = -point.y + rect.top+ center;
      
    return point;
  };
    
  ColorWheel.prototype.getHandler = function getHandler (point) {
    var cursorDistance = Math.hypot(point.x, point.y);
      var ref = this.options;
      var triangleRadius = ref.triangleRadius;
      var radius = ref.radius;
      var handler;
      
    // Spectre wheel
    if (cursorDistance >= triangleRadius && cursorDistance <= radius) { handler = this.rotateWheel; }
    // Triangle
    else if (this.moveCursor(point, true)) { handler = this.moveCursor; }
      
    if (handler) { return [ handler.name, handler.bind(this) ]; }
    else { return [ undefined, undefined ]; }
  };
    
  ColorWheel.prototype.rotateWheel = function rotateWheel (point) {
    var x = point.x;
      var y = point.y;
      var hueRad = Math.acos(x / Math.hypot(x, y));
      
    if (y < 0) { hueRad = FULL_ARC - hueRad; }
      
    this.options.hueRad = hueRad;
      
    this.color.setHue(Math.round(hueRad / DEG));
      
    this.layers.triangle.render();
    this.layers.cursor.render();
    this.layers.output.render();
  };
    
  ColorWheel.prototype.moveCursor = function moveCursor (point, start) {
    var x = point.x;
      var y = point.y;
      var ref = this.options;
      var hueRad = ref.hueRad;
      var vertices = ref.vertices;
      var triangleSide = ref.triangleSide;
      var triangleHeight = ref.triangleHeight;
      var cursorDistance = Math.hypot(x, y),
        s, v;
      
    if (hueRad != 0) {
      var cursorAngle = Math.acos(x / cursorDistance);
        
      if (y < 0) { cursorAngle = FULL_ARC - cursorAngle; }
        
      var rotation = cursorAngle - hueRad;
        
      x = cursorDistance * Math.cos(rotation);
      y = cursorDistance * Math.sin(rotation);
    }
      
    var relativeX   =x - vertices[1].x,
        saturationY =y - vertices[2].y,
        brightnessY = -y + vertices[1].y,
        saturationHypot = Math.hypot(relativeX, saturationY),
        brightnessHypot = Math.hypot(relativeX, brightnessY),
        saturationCos = saturationY / saturationHypot,
        brightnessCos = brightnessY / Math.hypot(relativeX, brightnessY);
      
    if (start) { return saturationCos >= 0.5 && saturationCos <= 1 && brightnessCos >= 0.5 && brightnessCos <= 1 && relativeX >= 0; }
      
    if (relativeX < 0) {
      s = 0;
      v = saturationY / triangleSide;
    } else {
      var saturationRad = Math.acos(saturationCos),
          brightnessRad = Math.acos(brightnessCos);
        
      if (brightnessRad > RAD_60 && brightnessRad % RAD_30) { s = brightnessHypot * Math.cos(brightnessRad - RAD_60) / triangleSide; }
      else { s = saturationRad / RAD_60; }
        
      if (saturationRad > RAD_60 && saturationRad % RAD_30) { v = saturationHypot * Math.cos(saturationRad - RAD_60) / triangleSide; }
      else { v = saturationHypot * Math.cos(saturationRad - RAD_30) / triangleHeight; }
    }
      
    this.color.setSV(s,v);
      
    this.updateCursor();
    this.layers.cursor.render();
    this.layers.output.render();
  };
    
  ColorWheel.prototype.dragStart = function dragStart (e) {
      var this$1 = this;

    if ('button' in e && e.button !== 0) { return; }
      
    var point = this.relate(getPoint(e));
      var ref = this.getHandler(point);
      var name = ref[0];
      var handler = ref[1];
      
    if (!handler) { return; }
      
    e.preventDefault();
      
    handler(point);
      
    this.callback.call(this, 0, name);
      
    var body = document.body;
      var touch = !!e.changedTouches,
        move = touch ? 'touchmove' : 'mousemove',
        end  = touch ? 'touchend'  : 'mouseup',
        cancel = touch ? 'touchcancel' : 'mouseleave';
      
    var moveHandler = function (e) {
      handler(this$1.relate(getPoint(e)));
      this$1.callback.call(this$1, 1, name);
    };
      
    var removeHandlers = function () {
      body.removeEventListener(move, moveHandler);
      body.removeEventListener(end, removeHandlers);
      body.removeEventListener(cancel, removeHandlers);
      this$1.callback.call(this$1, 2, name);
    };
      
    body.addEventListener(move, moveHandler);
    body.addEventListener(end, removeHandlers);
    body.addEventListener(cancel, removeHandlers);
  };

  var version = "1.0.1";

  ColorWheel.version = version;

  var input  = document.querySelector('#tryInput'),
      picker = new ColorWheel('#color-wheel', 256, function (eventCode, eventName) {
        // Do nothing if color is changed by input
        // (because it updates it)
        if (eventCode == 3) { return; }
        
        // Do nothing if color is chromatic
        if (eventName == 'rotateWheel' && this.color.HSV[1] == 0) { return; }
        
        updateInput();
      });

  function updateInput () {
    // Change background and value of input
    input.style.background = input.value = picker.color.getName();
    // Make text color readable
    input.style.color = picker.color.isDark() ? 'white' : '';
  }

  updateInput();

  input.addEventListener('input', function () {
    if (this.value == '') {
      this.style.background = '';
      this.style.color = '';
    } else {
      try {
        // Set color
        picker.setColor('name', this.value);

        // Change background and value of input
        this.style.background = picker.color.hex;
        // Make text color readable
        this.style.color = picker.color.isDark() ? 'white' : '';
      } catch (e) {}
    }
  });

}());
