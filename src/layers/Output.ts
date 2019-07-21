import { InternalOptions } from '../@types/main';

import Layer from './Layer';

export default class Output extends Layer {
  private layers: Layer[];

  constructor (el: CanvasRenderingContext2D | HTMLCanvasElement | string, options: InternalOptions, ...layers: Layer[]) {
    let ctx: CanvasRenderingContext2D = null;

    if (typeof el == 'string') el = <HTMLCanvasElement> document.querySelector(el);

    if (el instanceof CanvasRenderingContext2D) {
      ctx = el;
      el = null;
    } else if (!(el instanceof HTMLCanvasElement)) el = null;

    super(<HTMLCanvasElement> el, ctx, options);

    this.layers = layers;
  }

  public getDomElement (): HTMLCanvasElement {
    return this.el;
  }

  public update (): void {
    this.layers.forEach(layer => layer.update());
    super.update();
  }

  protected renderFn (): void {
    this.layers.forEach(layer => layer.output(this.ctx));
  }
}
