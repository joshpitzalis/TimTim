import { Schema } from "effect";

type BoundedStrokes = {
	readonly bounds: {
		readonly x: number;
		readonly y: number;
		readonly width: number;
		readonly height: number;
	};
	readonly strokes: ReadonlyArray<{
		readonly points: ReadonlyArray<{ readonly x: number; readonly y: number }>;
	}>;
};

export const STROKES_WITHIN_BOUNDS = Schema.makeFilter((lesson: BoundedStrokes) => {
	const { x, y, width, height } = lesson.bounds;
	if (width <= 0 || height <= 0 || !Number.isFinite(x + width) || !Number.isFinite(y + height))
		return false;
	return lesson.strokes.every((stroke) =>
		stroke.points.every(
			(point) => point.x >= x && point.x <= x + width && point.y >= y && point.y <= y + height,
		),
	);
});
