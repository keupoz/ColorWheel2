import { Tuple3 } from "./@types/helpers";
import COLORS from "./csscolors.json";
import { clamp1, clamp360, sl2sv, sv2sl } from "./utils";

const NAMES = {};

Object.keys(COLORS).forEach(name => {
    NAMES[COLORS[name]] = name;
});

export default class Color {
    public HSV: Tuple3<number>;
    public HSL: Tuple3<number>;
    public RGB: Tuple3<number>;

    public num: number;
    public hex: string;
    public css: string;

    constructor(h: number, s: number, v: number) {
        this.HSV = [0, 0, 0];
        this.HSL = [0, 0, 0];
        this.RGB = [0, 0, 0];

        this.setHSV(h, s, v);
    }

    public isDark(): boolean {
        let { RGB } = this;
        return 0.299 * RGB[0] + 0.587 * RGB[1] + 0.114 * RGB[2] <= 127.5;
    }

    public getName(): string {
        return NAMES[this.hex] || this.hex;
    }


    public setHSV(h: number, s: number, v: number): void {
        this.HSV[0] = clamp360(h);
        this.HSV[1] = clamp1(s);
        this.HSV[2] = clamp1(v);

        this.updateHSL();
        this.updateCSS();
        this.updateRGB();
        this.updateNUM();
        this.updateHEX();
    }

    public setHSL(h: number, s: number, l: number): void {
        this.HSL[0] = clamp360(h);
        this.HSL[1] = clamp1(s);
        this.HSL[2] = clamp1(l);

        this.updateHSV();
        this.updateCSS();
        this.updateRGB();
        this.updateNUM();
        this.updateHEX();
    }

    public setRGB(r: number, g: number, b: number): void {
        this.RGB[0] = r & 0xff;
        this.RGB[1] = g & 0xff;
        this.RGB[2] = b & 0xff;

        this.updateHSVfromRGB();
        this.updateHSL();
        this.updateCSS();
        this.updateNUM();
        this.updateHEX();
    }

    public setHEX(hex: string): void {
        let num: number = parseInt(hex.replace("#", ""), 16);

        if (isNaN(num)) throw new TypeError("Color: invalid hex code");

        this.setNUM(num);
    }

    public setName(name: string): void {
        name = name.replace(/\s+/g, "").toLowerCase();
        if (name in COLORS) this.setHEX(COLORS[name]);
        else this.setHEX(name);
    }

    public setNUM(num: number): void {
        this.num = num & 0xffffff;

        this.updateHEX();
        this.updateRGBfromNUM();
        this.updateHSVfromRGB();
        this.updateHSL();
        this.updateCSS();
    }

    public setHue(hue: number): void {
        this.HSV[0] = this.HSL[0] = clamp360(hue);

        this.updateCSS();
        this.updateRGB();
        this.updateNUM();
        this.updateHEX();
    }

    public setSV(s: number, v: number): void {
        this.setHSV(this.HSV[0], s, v);
    }

    private updateHSV(): void {
        let [h, sl, l] = this.HSL,
            [sv, v] = sl2sv(sl, l);

        this.HSV[0] = h;
        this.HSV[1] = sv;
        this.HSV[2] = v;
    }

    private updateHSVfromRGB(): void {
        let { RGB, HSV } = this,
            [r, g, b] = RGB,
            min: number = Math.min(r, g, b),
            max: number = Math.max(r, g, b),
            diff: number = max - min;

        if (max !== min) switch (max) {
            case r: HSV[0] = 60 * (g - b) / diff + (g < b ? 360 : 0); break;
            case g: HSV[0] = 60 * (b - r) / diff + 120; break;
            case b: HSV[0] = 60 * (r - g) / diff + 240; break;
        }

        HSV[1] = max == 0 ? 0 : 1 - min / max;
        HSV[2] = max / 0xff;
    }

    private updateHSL(): void {
        let [h, sv, v] = this.HSV,
            [sl, l] = sv2sl(sv, v);

        this.HSL[0] = h;
        this.HSL[1] = sl;
        this.HSL[2] = l;
    }

    private updateCSS(): void {
        let [h, s, l] = this.HSL;
        this.css = `hsl(${h},${s * 100}%,${l * 100}%)`;
    }

    // https://gist.github.com/mjackson/5311256
    private updateRGB(): void {
        let { RGB, HSV } = this,
            [h, s, v] = HSV,
            h1 = Math.floor((h / 60) % 6),
            vmin = (1 - s) * v,
            a = (v - vmin) * (h % 60) / 60,
            vinc = vmin + a,
            vdec = v - a;

        let c: Tuple3<number>;

        switch (h1) {
            case 0: c = [v, vinc, vmin]; break;
            case 1: c = [vdec, v, vmin]; break;
            case 2: c = [vmin, v, vinc]; break;
            case 3: c = [vmin, vdec, v]; break;
            case 4: c = [vinc, vmin, v]; break;
            case 5: c = [v, vmin, vdec]; break;
        }

        c.forEach((val: number, i: number) => RGB[i] = (val * 0xff) & 0xff);
    }

    private updateRGBfromNUM(): void {
        let { RGB, num } = this;

        RGB[0] = num >> 16;
        RGB[1] = num >> 8 & 0xff;
        RGB[2] = num & 0xff;
    }

    private updateNUM(): void {
        let [r, g, b] = this.RGB;

        this.num = (r << 16) + (g << 8) + b;
    }

    private updateHEX(): void {
        this.hex = "#" + this.num.toString(16).padStart(6, "0");
    }
}
