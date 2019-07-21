import { InternalOptions } from '../@types/main';

import Layer from './Layer';

import { FULL_ARC } from '../constants'

export default class Cursor extends Layer {
  constructor (options: InternalOptions) {
    super(null, null, options);
  }

  protected renderFn (): void {
    let { color, hueRad, cursor: { x, y }, triangleBorder } = this.options,
        { ctx } = this;

    this.center();
    ctx.rotate(-hueRad);

    this.path(() => {
      ctx.arc(x, y, 5, 0, FULL_ARC);
      ctx.strokeStyle = 'whitesmoke';
      ctx.lineWidth = triangleBorder;
      ctx.fillStyle = color.css;

      ctx.stroke();
      ctx.fill();
    });
  }
}
