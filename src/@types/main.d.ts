import Color from "../Color";
import { Tuple3 } from "./helpers";

export type ColorWheelCallback = (eventCode: number, eventName: string) => void;
export type ColorModel = "NAME" | "HUE" | "RGB" | "HSV" | "HSL" | "NUM" | "HEX" | "SV";

export type Point = { x: number, y: number };

export type InternalOptions = {
    vertices: Tuple3<Point>;
    cursor: Point;
    hueRad: number;
    color: Color;

    size: number;
    center: number;
    radius: number;
    spectreThickness: number;
    triangleRadius: number;
    triangleHeight: number;
    triangleBorder: number;
    triangleSide: number;
};
