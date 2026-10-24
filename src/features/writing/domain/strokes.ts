import { Schema } from "effect";
import type { PointerEvent, RefObject } from "react";
import { FINITE } from "./utils/constraints";

export const Point = Schema.Struct({ x: FINITE, y: FINITE });
export interface Point extends Schema.Schema.Type<typeof Point> {}

export const REFERENCE_STROKE = Schema.Struct({
	points: Schema.NonEmptyArray(Point).check(
		Schema.makeFilter((points) => {
			const length = points.reduce((total, point, index) => {
				const previous = points[index - 1];
				return previous ? total + Math.hypot(point.x - previous.x, point.y - previous.y) : total;
			}, 0);
			return length > 0 && Number.isFinite(length);
		}),
	),
});

export const ActiveStroke = Schema.Struct({
	pointerId: FINITE,
	points: Schema.Array(Point),
});
export interface ActiveStroke extends Schema.Schema.Type<typeof ActiveStroke> {}

export const Attempt = Schema.Struct({
	strokes: Schema.Array(Schema.Array(Point)),
	active: Schema.NullOr(ActiveStroke),
	feedback: Schema.Literals(["ready", "drawing", "interrupted", "correct", "incorrect"]),
});
export interface Attempt extends Schema.Schema.Type<typeof Attempt> {}

const ScreenMatrix = Schema.declare(
	(value): value is DOMMatrix => typeof DOMMatrix !== "undefined" && value instanceof DOMMatrix,
);

export const Capture = Schema.Struct({
	pointerId: FINITE,
	matrix: ScreenMatrix,
});
export interface Capture extends Schema.Schema.Type<typeof Capture> {}

const PadRef = Schema.declare(
	(value): value is RefObject<SVGSVGElement | null> =>
		typeof value === "object" && value !== null && "current" in value,
);
const Action = Schema.declare((value): value is () => void => typeof value === "function");
const PointerHandler = Schema.declare(
	(value): value is (event: PointerEvent<SVGSVGElement>) => void => typeof value === "function",
);

export const Drawing = Schema.Struct({
	padRef: PadRef,
	ready: Schema.Boolean,
	attempt: Attempt,
	reset: Action,
	check: Action,
	abort: Action,
	onPointerDown: PointerHandler,
	onPointerMove: PointerHandler,
	onPointerUp: PointerHandler,
	onPointerCancel: PointerHandler,
	onLostPointerCapture: PointerHandler,
});
export interface Drawing extends Schema.Schema.Type<typeof Drawing> {}
