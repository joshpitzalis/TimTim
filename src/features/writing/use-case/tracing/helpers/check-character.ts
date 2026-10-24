import type { Lesson } from "../../../domain/lessons";
import type { Point } from "../../../domain/strokes";

function distanceSquared(point: Point, start: Point, end: Point): number {
	const dx = end.x - start.x;
	const dy = end.y - start.y;
	const length = dx * dx + dy * dy;
	const fraction =
		length === 0
			? 0
			: Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / length));
	return (point.x - start.x - fraction * dx) ** 2 + (point.y - start.y - fraction * dy) ** 2;
}

function samples(strokes: readonly (readonly Point[])[], spacing: number): Point[] {
	return strokes.flatMap((stroke) =>
		stroke.flatMap((end, index) => {
			const start = stroke[index - 1];
			if (!start) return [end];
			const steps = Math.max(1, Math.ceil(Math.hypot(end.x - start.x, end.y - start.y) / spacing));
			return Array.from({ length: steps }, (_, step) => ({
				x: start.x + ((end.x - start.x) * (step + 1)) / steps,
				y: start.y + ((end.y - start.y) * (step + 1)) / steps,
			}));
		}),
	);
}

function coverage(
	points: readonly Point[],
	target: readonly (readonly Point[])[],
	tolerance: number,
): number {
	if (points.length === 0) return 0;
	const matched = points.filter((point) =>
		target.some((stroke) =>
			stroke.some(
				(end, index) => distanceSquared(point, stroke[index - 1] ?? end, end) <= tolerance ** 2,
			),
		),
	);
	return matched.length / points.length;
}

export function checkCharacter(lesson: Lesson, strokes: readonly (readonly Point[])[]): boolean {
	const size = Math.min(lesson.bounds.width, lesson.bounds.height);
	const reference = lesson.strokes.map((stroke) => stroke.points);
	// shortcut: provisional shape tolerances; calibrate with real finger and stylus attempts.
	const tolerance = size * 0.055;
	return (
		coverage(samples(reference, size / 100), strokes, tolerance) >= 0.9 &&
		coverage(samples(strokes, size / 100), reference, tolerance) >= 0.9
	);
}
