import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "vitest";
import { ErrorBox } from "../../../../pages/index";
import { DEVELOPMENT_LESSON } from "../../use-case/tracing/constants/development-lesson";
import { parseLesson } from "../../use-case/tracing/helpers";

test("the original development lesson parses with honest review status and ordered strokes", () => {
	const result = parseLesson(DEVELOPMENT_LESSON);
	expect(result.kind).toBe("ready");
	if (result.kind !== "ready") throw new Error("Development lesson did not parse");
	expect(result.lesson.glyph).toBe("ल");
	expect(result.lesson.pronunciation).toBe("la");
	expect(result.lesson.review).toBe("pending");
	expect(result.lesson.strokes).toHaveLength(3);
});

test("unusable content fails before interaction instead of becoming handwriting feedback", () => {
	const first = DEVELOPMENT_LESSON.strokes[0];
	if (!first) throw new Error("Fixture needs a stroke");
	const invalid = [
		null,
		{ ...DEVELOPMENT_LESSON, id: " " },
		{ ...DEVELOPMENT_LESSON, pronunciation: "" },
		{ ...DEVELOPMENT_LESSON, glyph: "" },
		{ ...DEVELOPMENT_LESSON, strokes: [] },
		...[0, -1, NaN, Infinity].map((width) => ({
			...DEVELOPMENT_LESSON,
			bounds: { ...DEVELOPMENT_LESSON.bounds, width },
		})),
		...[
			[],
			[{ x: 20, y: 30 }],
			[
				{ x: 20, y: 30 },
				{ x: 20, y: 30 },
			],
			[
				{ x: NaN, y: 30 },
				{ x: 30, y: 40 },
			],
			[
				{ x: -1, y: 20 },
				{ x: 40, y: 20 },
			],
			[
				{ x: 20, y: 20 },
				{ x: 101, y: 20 },
			],
		].map((points) => ({
			...DEVELOPMENT_LESSON,
			strokes: [{ ...first, points }],
		})),
	];
	for (const input of invalid) {
		expect(parseLesson(input).kind).toBe("unusable");
	}
});

test("the content boundary preserves the authored teaching order", () => {
	const result = parseLesson({
		...DEVELOPMENT_LESSON,
		strokes: [
			{
				hint: "Right to left",
				points: [
					{ x: 70, y: 20 },
					{ x: 40, y: 20 },
				],
			},
			{
				hint: "Down",
				points: [
					{ x: 10, y: 30 },
					{ x: 10, y: 70 },
				],
			},
		],
	});
	expect(result.kind).toBe("ready");
	if (result.kind !== "ready") throw new Error("Authored sequence did not parse");
	expect(result.lesson.strokes.map((stroke) => stroke.points[0])).toEqual([
		{ x: 70, y: 20 },
		{ x: 10, y: 30 },
	]);
});

test("invalid content renders a distinct failure without learner controls or completion", () => {
	const content = parseLesson({ ...DEVELOPMENT_LESSON, strokes: [] });
	expect(content.kind).toBe("unusable");
	if (content.kind !== "unusable") throw new Error("Invalid lesson did not fail");
	const markup = renderToStaticMarkup(createElement(ErrorBox, { message: content.message }));
	expect(markup).toContain('role="alert"');
	expect(markup).toContain("Lesson unavailable");
	expect(markup).toContain("Its content needs repair.");
	expect(markup).not.toContain("Hindi writing practice area");
	expect(markup).not.toContain("<svg");
	expect(markup).not.toContain("<button");
	expect(markup).not.toMatch(/Retry|completed|Ready to trace|stroke drawn/i);
});
