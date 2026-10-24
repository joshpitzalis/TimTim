import { Result, Schema } from "effect";
import { type LessonContent, LESSON } from "../../../domain/lessons";
import type { Attempt, Point } from "../../../domain/strokes";

export const EMPTY: Attempt = { strokes: [], active: null, feedback: "ready" };

export function sameMatrix(left: DOMMatrix, right: DOMMatrix): boolean {
	return (
		left.a === right.a &&
		left.b === right.b &&
		left.c === right.c &&
		left.d === right.d &&
		left.e === right.e &&
		left.f === right.f
	);
}

export function toPoint(
	svg: SVGSVGElement,
	x: number,
	y: number,
): { readonly point: Point; readonly matrix: DOMMatrix } | null {
	const matrix = svg.getScreenCTM();
	if (!matrix || matrix.a * matrix.d - matrix.b * matrix.c === 0) return null;
	const point = new DOMPoint(x, y).matrixTransform(matrix.inverse());
	if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) return null;
	return { point: { x: point.x, y: point.y }, matrix };
}

export function parseLesson(input: unknown): LessonContent {
	const result = Schema.decodeUnknownResult(LESSON)(input);
	if (Result.isFailure(result)) {
		return {
			kind: "unusable",
			message: "This lesson cannot be opened. Its content needs repair.",
		};
	}
	return { kind: "ready", lesson: result.success };
}

export function pointsAttribute(points: readonly Point[]): string {
	return points.map((point) => `${point.x},${point.y}`).join(" ");
}
