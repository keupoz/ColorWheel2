# ColorWheel 2
Demo: https://keupoz.github.io/ColorWheel2/

Touch-friendly HSV color picker. Uses one `canvas` tag and has it's own color manager.

## Usage
ColorWheel2 is a UMD module, so you can include it via script tag or require statement. Also it can be imported as an ES module (use `ColorWheel2.es.js`)

Install via npm:
```bash
npm i @keupoz/colorwheel2
```

```html
<script src="ColorWheel2.min.js"></script>
```

```javascript
import ColorWheel from '@keupoz/colorwheel2';
// or
const ColorWheel = require('./ColorWheel2.js');
let picker = new ColorWheel('#output', 256, function (eventCode, eventName) {
  // Do something here when color is changed
});
```

## API

### Constructor

```javascript
new ColorWheel(canvas, size, callback);
```

- **canvas** - CSS selector, `HTMLCanvasElement` or `CanvasRenderingContext2D`. Set to null to create new instances automatically
- **size** - output canvas size in pixels
- **callback** - called after each color change with arguments `eventCode` and `eventName`

#### Event codes
- `0`: interaction started
- `1`: interaction continued
- `2`: interaction ended
- `3`: updated picker after changing color programmatically

#### Event names
- `rotateWheel`: changed hue
- `moveCursor`: moved cursor
- `update`: updated picker. Event code is always `3`

### Properties

#### ColorWheel.version
Static property

```javascript
ColorWheel.version; // '1.0.0'
```

#### ColorWheel.domElement
Output canvas element

```javascript
document.body.appendChild(picker.domElement);
picker.canvas.classList.add('picker');
```

#### ColorWheel.color
Color instance

**Properties**:
- `HSV`, `HSL`, `RGB` - arrays. They aren't replaced while changing the color, so you can reuse them
- `hex`, `num`
- `css` - css string in HSL model

**Methods**:
- `isDark` - can be used to make text readable. Returns `true` if text color should be white
- `getName` - returns CSS name for current color if it exists, otherwise returns hex code

#### ColorWheel.setSize
Sets output canvas size

```javascript
picker.setSize(300);
```

#### ColorWheel.setColor
Removed in 1.2.0. Use set methods from color instance and update picker via `picker.update()`. See `dist/ColorWheel2.d.ts` for color methods

```javascript
picker.setHSV(180,1,1);
picker.update();
```
