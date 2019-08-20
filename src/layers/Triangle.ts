import { InternalOptions } from "../@types/main";
import { SATURATION_GRADIENT_Y_MULTIPLIER } from "../constants";
import Layer from "./Layer";

export default class Triangle extends Layer {
    private brightnessGradient: CanvasGradient;
    private saturationGradient: CanvasGradient;

    constructor(options: InternalOptions) {
        super(null, null, options);
    }

    public update(): void {
        let { vertices, triangleRadius } = this.options;

        let saturationGradient = this.ctx.createLinearGradient(vertices[2].x, vertices[2].y, triangleRadius / 4, triangleRadius * SATURATION_GRADIENT_Y_MULTIPLIER),
            brightnessGradient = this.ctx.createLinearGradient(vertices[1].x, vertices[0].y, vertices[0].x, vertices[0].y);

        saturationGradient.addColorStop(0, "white");
        saturationGradient.addColorStop(1, "rgba(255,255,255,0)");

        brightnessGradient.addColorStop(0, "black");
        brightnessGradient.addColorStop(1, "transparent");

        this.brightnessGradient = brightnessGradient;
        this.saturationGradient = saturationGradient;

        super.update();
    }

    protected renderFn(): void {
        let { ctx, brightnessGradient, saturationGradient } = this,
            { color: { HSL }, hueRad, vertices, triangleBorder } = this.options;

        this.center();
        ctx.rotate(-hueRad);

        // Triangle shape
        this.path(() => {
            ctx.moveTo(vertices[0].x, vertices[0].y);
            ctx.lineTo(vertices[1].x, vertices[1].y);
            ctx.lineTo(vertices[2].x, vertices[2].y);
        });

        // Hue filling
        ctx.fillStyle = `hsl(${HSL[0]},100%,50%)`;
        ctx.fill();

        // Saturation and brightness filling
        ctx.fillStyle = brightnessGradient;
        ctx.fill();

        this.safe(() => {
            ctx.globalCompositeOperation = "lighter";
            ctx.fillStyle = saturationGradient;
            ctx.fill();
        });

        // Stroke triangle
        ctx.strokeStyle = "whitesmoke";
        ctx.lineWidth = triangleBorder;
        ctx.stroke();
    }
}
