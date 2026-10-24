import { Schema } from "effect";
import { FINITE, LABEL } from "./utils/constraints";
import { STROKES_WITHIN_BOUNDS } from "./utils/strokes-within-bounds";
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
	.check(STROKES_WITHIN_BOUNDS)
	.pipe(Schema.brand("Lesson"));

export interface Lesson extends Schema.Schema.Type<typeof LESSON> {}

export type LessonContent =
	| { readonly kind: "ready"; readonly lesson: Lesson }
	| { readonly kind: "unusable"; readonly message: string };
