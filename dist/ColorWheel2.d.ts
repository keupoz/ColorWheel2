type Tuple3<item> = [item, item, item];

interface ColorMethods {
    setHSV: (h: number, s: number, v: number) => void;
    setHSL: (h: number, s: number, l: number) => void;
    setRGB: (r: number, g: number, b: number) => void;
    setHEX: (hex: string) => void;
    setName: (name: string) => void;
    setNUM: (num: number) => void;
    setHue: (hue: number) => void;
    setSV: (s: number, v: number) => void;
}
declare class Color implements ColorMethods {
    HSV: Tuple3<number>;
    HSL: Tuple3<number>;
    RGB: Tuple3<number>;
    num: number;
    hex: string;
    css: string;
    constructor(h: number, s: number, v: number);
    isDark(): boolean;
    getName(): string;
    setHSV(h: number, s: number, v: number): void;
    setHSL(h: number, s: number, l: number): void;
    setRGB(r: number, g: number, b: number): void;
    setHEX(hex: string): void;
    setName(name: string): void;
    setNUM(num: number): void;
    setHue(hue: number): void;
    setSV(s: number, v: number): void;
    private updateHSV;
    private updateHSVfromRGB;
    private updateHSL;
    private updateCSS;
    private updateRGB;
    private updateRGBfromNUM;
    private updateNUM;
    private updateHEX;
}

type ColorWheelCallback = (eventCode: number, eventName: string) => void;

declare class ColorWheel {
    static version: string;
    color: Color;
    domElement: HTMLCanvasElement;
    private layers;
    private options;
    private callback;
    constructor(el: CanvasRenderingContext2D | HTMLCanvasElement | string | null, size: number, callback?: ColorWheelCallback);
    setSize(size: number): void;
    update(): void;
    private updateCursor;
    private relate;
    private getHandler;
    private rotateWheel;
    private moveCursor;
    private dragStart;
}

export default ColorWheel;
