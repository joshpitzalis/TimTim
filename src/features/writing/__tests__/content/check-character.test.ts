import { expect, test } from "vitest";
import { checkCharacter } from "../../use-case/tracing";
import { DEVELOPMENT_LESSON } from "../../use-case/tracing/constants/development-lesson";
import { parseLesson } from "../../use-case/tracing/helpers";

const content = parseLesson(DEVELOPMENT_LESSON);
if (content.kind !== "ready") throw new Error("Invalid development lesson");
const lesson = content.lesson;
const reference = lesson.strokes.map((stroke) => stroke.points);

test("accepts the whole shape with any stroke order, direction, or segmentation", () => {
	expect(checkCharacter(lesson, reference)).toBe(true);
	expect(
		checkCharacter(
			lesson,
			[...reference].reverse().map((stroke) => [...stroke].reverse()),
		),
	).toBe(true);
	expect(
		checkCharacter(
			lesson,
			reference.flatMap((stroke) =>
				stroke.slice(1).map((end, index) => [stroke[index] ?? end, end]),
			),
		),
	).toBe(true);
	expect(
		checkCharacter(
			lesson,
			reference.map((stroke) => stroke.map((point) => ({ x: point.x + 2, y: point.y - 2 }))),
		),
	).toBe(true);
});

test("rejects empty, incomplete, misplaced, and extra ink", () => {
	expect(checkCharacter(lesson, [])).toBe(false);
	expect(checkCharacter(lesson, [[{ x: 67, y: 25 }]])).toBe(false);
	expect(checkCharacter(lesson, reference.slice(1))).toBe(false);
	expect(
		checkCharacter(
			lesson,
			reference.map((stroke) => stroke.map((point) => ({ x: point.x + 18, y: point.y }))),
		),
	).toBe(false);
	expect(
		checkCharacter(lesson, [
			...reference,
			[
				{ x: 0, y: 0 },
				{ x: 100, y: 100 },
			],
		]),
	).toBe(false);
});
