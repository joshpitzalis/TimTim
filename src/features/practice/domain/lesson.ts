import { Result, Schema } from "effect";

const FINITE = Schema.Number.check(Schema.isFinite());
const LABEL = Schema.String.check(
	Schema.makeFilter((value) => value.trim().length > 0),
);
export const Point = Schema.Struct({ x: FINITE, y: FINITE });
export interface Point extends Schema.Schema.Type<typeof Point> {}

const REFERENCE_STROKE = Schema.Struct({
	hint: LABEL,
	points: Schema.NonEmptyArray(Point).check(
		Schema.makeFilter((points) => {
			const length = points.reduce((total, point, index) => {
				const previous = points[index - 1];
				return previous
					? total + Math.hypot(point.x - previous.x, point.y - previous.y)
					: total;
			}, 0);
			return length > 0 && Number.isFinite(length);
		}),
	),
});

const LESSON = Schema.Struct({
	id: LABEL,
	glyph: LABEL,
	pronunciation: LABEL,
	review: Schema.Literal("pending"),
	bounds: Schema.Struct({
		x: FINITE,
		y: FINITE,
		width: FINITE,
		height: FINITE,
	}),
	strokes: Schema.NonEmptyArray(REFERENCE_STROKE),
})
	.check(
		Schema.makeFilter((lesson) => {
			const { x, y, width, height } = lesson.bounds;
			if (
				width <= 0 ||
				height <= 0 ||
				!Number.isFinite(x + width) ||
				!Number.isFinite(y + height)
			)
				return false;
			return lesson.strokes.every((stroke) =>
				stroke.points.every(
					(point) =>
						point.x >= x &&
						point.x <= x + width &&
						point.y >= y &&
						point.y <= y + height,
				),
			);
		}),
	)
	.pipe(Schema.brand("Lesson"));

export interface Lesson extends Schema.Schema.Type<typeof LESSON> {}

export type LessonContent =
	| { readonly kind: "ready"; readonly lesson: Lesson }
	| { readonly kind: "unusable"; readonly message: string };

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
