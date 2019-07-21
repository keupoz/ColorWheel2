import { InternalOptions } from '../@types/main';

import Layer from './Layer';

import { DEG, FULL_ARC } from '../constants';

export default class Background extends Layer {
  constructor (options: InternalOptions) {
    super(null, null, options);
  }

  protected renderFn (): void {
    let { radius, spectreThickness, triangleRadius } = this.options,
        { ctx } = this;

    this.center();

    // Background with center shadow
    this.path(() => {
      ctx.arc(0,0, radius, 0, FULL_ARC);

      let gradient = ctx.createRadialGradient(0,0,0, 0,0,radius);

      gradient.addColorStop(0, '#000');
      gradient.addColorStop(1, '#555');

      ctx.fillStyle = gradient;
      ctx.fill();
    });

    // Center circle
    this.path(() => {
      ctx.arc(0,0, radius - 2 * spectreThickness, 0, FULL_ARC);
      ctx.fillStyle = '#444';
      ctx.fill();
    });

    // Spectre wheel
    let spectreRadius = radius - spectreThickness / 2;
    ctx.lineWidth = spectreThickness;

    for (let deg = 0; deg < 360; deg++) {
      this.path(() => {
        ctx.arc(0,0, spectreRadius, deg * DEG, (deg + 1.5) * DEG);
        ctx.strokeStyle = `hsl(${-deg},100%,50%)`;
        ctx.stroke();
      });
    }

    // Triangle path
    this.path(() => {
      ctx.arc(0,0, triangleRadius, 0, FULL_ARC);
      ctx.fillStyle = 'rgba(68,68,68,0.25)';
      ctx.fill();
    });
  }
}
