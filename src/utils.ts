import { Tuple2 } from "./@types/helpers";
import { Point } from "./@types/main";

function clamp(min: number, max: number, number: number): number {
    return Math.max(min, Math.min(number, max));
}

export function clamp1(number: number): number {
    return clamp(0, 1, number);
}

export function clamp360(deg: number): number {
    deg -= 360 * (deg / 360 | 0);
    if (deg < 0) deg += 360;
    return Math.round(deg);
}

export function sv2sl(s: number, v: number): Tuple2<number> {
    let a: number = (2 - s) * v;

    s = s * v / (a <= 1 ? a : 2 - a) || 0;
    v = a / 2;

    return [s, v];
}

export function sl2sv(s: number, l: number): Tuple2<number> {
    s *= l < 0.5 ? l : 1 - l;

    l += s;
    s = 2 * s / l;

    return [s, l];
}

export function on(el: EventTarget, events: string, handler: EventListener): void {
    events.split(" ").forEach(event => el.addEventListener(event, handler));
}

export function isTouchEvent(event: Event): event is TouchEvent {
    return Array.isArray((event as TouchEvent).changedTouches);
}

export function getPoint(event: MouseEvent | TouchEvent): Point {
    let { clientX: x, clientY: y } = isTouchEvent(event) ? event.changedTouches[0] : event;
    return { x, y };
}
