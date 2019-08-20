import { InternalOptions } from "../@types/main";

export default abstract class Layer {
    protected el: HTMLCanvasElement;
    protected ctx: CanvasRenderingContext2D;
    protected options: InternalOptions;

    protected abstract renderFn(): void;

    constructor(el: HTMLCanvasElement, ctx: CanvasRenderingContext2D, options: InternalOptions) {
        this.options = options;

        this.el = el || document.createElement("canvas");
        this.ctx = ctx || this.el.getContext("2d");
    }

    public setSize(size: number): void {
        this.el.width = this.el.height = size;
    }

    public update(): void {
        this.setSize(this.options.size);
        this.render();
    }

    public output(ctx: CanvasRenderingContext2D): void {
        ctx.drawImage(this.el, 0, 0);
    }

    public render(): void {
        this.clear();
        this.safe(this.renderFn.bind(this));
    }

    protected safe(cb: () => void): void {
        this.ctx.save();
        cb();
        this.ctx.restore();
    }

    protected path(cb: () => void): void {
        this.ctx.beginPath();
        cb();
        this.ctx.closePath();
    }

    protected clear(): void {
        let { size } = this.options;

        this.ctx.clearRect(0, 0, size, size);
    }

    protected center(): void {
        let { center } = this.options;

        this.ctx.translate(center, center);
    }
}
