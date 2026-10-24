import type { Lesson } from "../../../domain/lessons";
import type { Point } from "../../../domain/strokes";

export type Assessment =
	| { readonly kind: "passed" }
	| { readonly kind: "retry"; readonly missing: boolean; readonly stray: boolean }
	| { readonly kind: "unavailable" };

export interface Tolerance {
	readonly distance: number;
	readonly missing: number;
	readonly stray: number;
}

// shortcut: forgiving provisional margins, calibrate against reviewed handwriting when requested.
export const PROVISIONAL_TOLERANCE: Tolerance = { distance: 0.04, missing: 0.08, stray: 0.06 };
const RESOLUTION = 200;
type Segment = readonly [Point, Point];

function segments(paths: readonly (readonly Point[])[]): readonly Segment[] {
	const result: Segment[] = [];
	for (const path of paths) {
		for (const [index, point] of path.entries()) result.push([path[index - 1] ?? point, point]);
	}
	return result;
}

function distanceSquared(point: Point, segment: Segment): number {
	const [start, end] = segment;
	const dx = end.x - start.x,
		dy = end.y - start.y;
	const length = dx * dx + dy * dy;
	const along =
		length === 0
			? 0
			: Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / length));
	return (point.x - start.x - along * dx) ** 2 + (point.y - start.y - along * dy) ** 2;
}

function* cells(lines: readonly Segment[]): Generator<Point> {
	const seen = new Set<string>();
	const lower = (value: number): number => Math.ceil(value - 1 - 1e-9);
	const upper = (value: number): number => Math.floor(value + 1e-9);
	for (const [start, end] of lines) {
		const dx = end.x - start.x,
			dy = end.y - start.y;
		for (let x = lower(Math.min(start.x, end.x)); x <= upper(Math.max(start.x, end.x)); x++) {
			const from = dx === 0 ? 0 : Math.max(0, Math.min((x - start.x) / dx, (x + 1 - start.x) / dx));
			const to = dx === 0 ? 1 : Math.min(1, Math.max((x - start.x) / dx, (x + 1 - start.x) / dx));
			if (from > to) continue;
			const firstY = start.y + from * dy,
				lastY = start.y + to * dy;
			for (let y = lower(Math.min(firstY, lastY)); y <= upper(Math.max(firstY, lastY)); y++) {
				const key = `${x},${y}`;
				if (seen.has(key)) continue;
				seen.add(key);
				yield { x: x + 0.5, y: y + 0.5 };
			}
		}
	}
}

function unmatched(
	points: Iterable<Point>,
	target: readonly Segment[],
	distance: number,
	allowance: number,
): number {
	let count = 0;
	for (const point of points) {
		if (target.some((line) => distanceSquared(point, line) <= distance ** 2)) continue;
		count++;
		if (count > allowance) break;
	}
	return count;
}

export function assessLetter(
	lesson: Lesson,
	strokes: readonly (readonly Point[])[],
	tolerance: Tolerance = PROVISIONAL_TOLERANCE,
): Assessment {
	const { x, y, width, height } = lesson.bounds;
	if (
		![x, y, width, height, tolerance.distance, tolerance.missing, tolerance.stray].every(
			Number.isFinite,
		) ||
		width <= 0 ||
		height <= 0 ||
		tolerance.distance <= 0 ||
		tolerance.missing < 0 ||
		tolerance.missing >= 1 ||
		tolerance.stray < 0 ||
		tolerance.stray >= 1
	)
		return { kind: "unavailable" };
	const normalize = (paths: readonly (readonly Point[])[]): readonly (readonly Point[])[] =>
		paths.map((path) =>
			path.map((point) => ({
				x: ((point.x - x) / width) * RESOLUTION,
				y: ((point.y - y) / height) * RESOLUTION,
			})),
		);
	const reference = normalize(lesson.strokes.map((stroke) => stroke.points));
	const attempt = normalize(strokes);
	if (
		[...reference, ...attempt].some((path) =>
			path.some((point) => !Number.isFinite(point.x) || !Number.isFinite(point.y)),
		)
	)
		return { kind: "unavailable" };
	const referenceSegments = segments(reference);
	const attemptSegments = segments(attempt);
	const referenceCells = [...cells(referenceSegments)];
	if (referenceCells.length === 0) return { kind: "unavailable" };
	const distance = tolerance.distance * RESOLUTION;
	const missing =
		attemptSegments.every(([start, end]) => start.x === end.x && start.y === end.y) ||
		unmatched(
			referenceCells,
			attemptSegments,
			distance,
			referenceCells.length * tolerance.missing,
		) >
			referenceCells.length * tolerance.missing;
	// Grid iteration needs representable integer neighbours, even for finite input.
	const unsafeGrid = attempt.some((path) =>
		path.some(
			(point) =>
				![point.x, point.y].every(
					(value) =>
						Number.isSafeInteger(Math.floor(value) - 1) &&
						Number.isSafeInteger(Math.ceil(value) + 1),
				),
		),
	);
	const allowance = referenceCells.length * tolerance.stray;
	const stray =
		unsafeGrid ||
		unmatched(cells(attemptSegments), referenceSegments, distance, allowance) > allowance;

	return missing || stray ? { kind: "retry", missing, stray } : { kind: "passed" };
}
