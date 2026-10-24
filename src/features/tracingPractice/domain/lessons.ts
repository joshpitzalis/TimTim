import { Schema } from "effect";
import { FINITE, LABEL } from "./constraints";
import { REFERENCE_STROKE } from "./strokes";

export const LESSON = Schema.Struct({
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
			if (width <= 0 || height <= 0 || !Number.isFinite(x + width) || !Number.isFinite(y + height))
				return false;
			return lesson.strokes.every((stroke) =>
				stroke.points.every(
					(point) => point.x >= x && point.x <= x + width && point.y >= y && point.y <= y + height,
				),
			);
		}),
	)
	.pipe(Schema.brand("Lesson"));

export interface Lesson extends Schema.Schema.Type<typeof LESSON> {}

export type LessonContent =
	| { readonly kind: "ready"; readonly lesson: Lesson }
	| { readonly kind: "unusable"; readonly message: string };
