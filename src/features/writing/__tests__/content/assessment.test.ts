import fc from "fast-check";
import { expect, test } from "vitest";
import { assessLetter } from "../../use-case/tracing";
import { DEVELOPMENT_LESSON } from "../../use-case/tracing/constants/development-lesson";
import { parseLesson } from "../../use-case/tracing/helpers";

const parsed = parseLesson(DEVELOPMENT_LESSON);
if (parsed.kind !== "ready") throw new Error("Invalid reference fixture");
const lesson = parsed.lesson;
const trace = lesson.strokes.map((stroke) => stroke.points);

test("a complete reference trace passes while half a letter cannot pass", () => {
	expect(assessLetter(lesson, trace)).toEqual({ kind: "passed" });
	expect(assessLetter(lesson, trace.slice(1))).toEqual({
		kind: "retry",
		missing: true,
		stray: false,
	});
});

test("shape matching ignores stroke order, direction, pen lifts, sampling density and repeated tracing", () => {
	const reversed = [...trace].reverse().map((path) => [...path].reverse());
	const split = trace.flatMap((path) =>
		path.slice(1).map((point, index) => [path[index] ?? point, point]),
	);
	const dense = split.map(([start, end]) => {
		if (!start || !end) throw new Error("Missing segment");
		return Array.from({ length: 31 }, (_, index) => ({
			x: start.x + ((end.x - start.x) * index) / 30,
			y: start.y + ((end.y - start.y) * index) / 30,
		}));
	});
	for (const attempt of [reversed, split, dense, [...trace, ...reversed, ...dense]]) {
		expect(assessLetter(lesson, attempt)).toEqual({ kind: "passed" });
	}
});

test("substantial extra ink cannot be diluted by repeatedly tracing the right shape", () => {
	const slash = [
		{ x: 10, y: 90 },
		{ x: 90, y: 10 },
	];
	const messy = [...trace, slash];
	const retraced = [...messy, ...Array.from({ length: 40 }, () => trace).flat()];
	for (const attempt of [messy, retraced])
		expect(assessLetter(lesson, attempt)).toEqual({ kind: "retry", missing: false, stray: true });
});

test("small deviations are forgiving but wrong placement, size, missing parts and empty ink fail", () => {
	const moved = (dx: number, scale: number) =>
		trace.map((path) =>
			path.map((point) => ({ x: point.x * scale + dx, y: point.y * scale + dx })),
		);
	expect(assessLetter(lesson, moved(2, 1))).toEqual({ kind: "passed" });
	for (const attempt of [moved(15, 1), moved(0, 0.5), [], [[{ x: 25, y: 25 }]]]) {
		expect(assessLetter(lesson, attempt).kind).toBe("retry");
	}
	expect(assessLetter(lesson, trace.slice(0, 2))).toEqual({
		kind: "retry",
		missing: true,
		stray: false,
	});
});

test("non-finite geometry is an application failure, while off-pad ink is a learner retry", () => {
	for (const invalid of [NaN, Infinity, -Infinity])
		expect(assessLetter(lesson, [[{ x: invalid, y: 50 }]])).toEqual({ kind: "unavailable" });
	expect(
		assessLetter(lesson, [
			...trace,
			[
				{ x: -1e100, y: 50 },
				{ x: 1e100, y: 50 },
			],
		]),
	).toEqual({ kind: "retry", missing: false, stray: true });
});

test("segmentation and event density preserve the verdict around the tolerance boundary", () => {
	fc.assert(
		fc.property(fc.double({ min: 0, max: 12, noNaN: true }), (shift) => {
			const shifted = trace.map((path) =>
				path.map((point) => ({ x: point.x + shift, y: point.y })),
			);
			const dense = shifted.map((path) =>
				path.flatMap((end, index) => {
					const start = path[index - 1];
					return start
						? Array.from({ length: 13 }, (_, step) => ({
								x: start.x + ((end.x - start.x) * (step + 1)) / 13,
								y: start.y + ((end.y - start.y) * (step + 1)) / 13,
							}))
						: [end];
				}),
			);
			const split = dense.flatMap((path) =>
				path.slice(1).map((end, index) => [path[index] ?? end, end]),
			);
			expect(assessLetter(lesson, dense)).toEqual(assessLetter(lesson, shifted));
			expect(
				assessLetter(
					lesson,
					[...split].reverse().map((path) => [...path].reverse()),
				),
			).toEqual(assessLetter(lesson, shifted));
		}),
		{ numRuns: 80 },
	);
});

test("tiny missing gaps and tails are tolerated without inventing bridges between reference parts", () => {
	const tinyGap = trace.map((path) => path.slice(1));
	// Keep the body intact; remove only a short section from the stem and headline ends.
	const trimmed = [
		trace[0] ?? [],
		[
			{ x: 67, y: 27 },
			{ x: 67, y: 76 },
		],
		[
			{ x: 24, y: 25 },
			{ x: 77, y: 25 },
		],
	];
	expect(
		assessLetter(lesson, [
			...trimmed,
			[
				{ x: 77, y: 25 },
				{ x: 79, y: 27 },
			],
		]),
	).toEqual({ kind: "passed" });
	expect(assessLetter(lesson, tinyGap).kind).toBe("retry");
	const joined = [trace.flat()];
	expect(assessLetter(lesson, joined).kind).toBe("retry");
});

test("a cloud of disconnected taps cannot stand in for drawing the letter", () => {
	const taps = trace.flatMap((path) =>
		path.flatMap((point, index) => {
			const start = path[index - 1];
			return start
				? Array.from({ length: 100 }, (_, step) => [
						{
							x: start.x + ((point.x - start.x) * step) / 100,
							y: start.y + ((point.y - start.y) * step) / 100,
						},
					])
				: [[point]];
		}),
	);
	expect(assessLetter(lesson, taps)).toEqual({ kind: "retry", missing: true, stray: false });
});

test("small stray marks use the same allowance on either side of the pad edge", () => {
	for (const mark of [
		[
			{ x: 98, y: 50 },
			{ x: 100, y: 50 },
		],
		[
			{ x: 99, y: 50 },
			{ x: 101, y: 50 },
		],
		[
			{ x: 100, y: 50 },
			{ x: 100.001, y: 50 },
		],
		[
			{ x: -1, y: 50 },
			{ x: 1, y: 50 },
		],
	])
		expect(assessLetter(lesson, [...trace, mark])).toEqual({ kind: "passed" });
});

test("distinct stray marks inside and outside the pad accumulate without retracing dilution", () => {
	const inside = [
		{ x: 90, y: 80 },
		{ x: 90, y: 85 },
	];
	const outside = [
		{ x: 90.5, y: -21 },
		{ x: 90.5, y: -16 },
	];
	expect(assessLetter(lesson, [...trace, inside])).toEqual({ kind: "passed" });
	expect(assessLetter(lesson, [...trace, outside])).toEqual({ kind: "passed" });
	const both = [...trace, inside, outside];
	expect(assessLetter(lesson, both)).toEqual({ kind: "retry", missing: false, stray: true });
	expect(assessLetter(lesson, [...both, ...both, ...trace])).toEqual({
		kind: "retry",
		missing: false,
		stray: true,
	});
});

test("large finite excursions stop once their stray ink exceeds the allowance", () => {
	for (const extent of [1e12, 1e100]) {
		expect(
			assessLetter(lesson, [
				...trace,
				[
					{ x: -extent, y: 50 },
					{ x: extent, y: 50 },
				],
			]),
		).toEqual({ kind: "retry", missing: false, stray: true });
	}
});
