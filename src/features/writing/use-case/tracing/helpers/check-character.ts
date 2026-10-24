import type { Lesson } from "../../../domain/lessons";
import type { Point } from "../../../domain/strokes";
import { assessLetter } from "./assessment";

export function checkCharacter(lesson: Lesson, strokes: readonly (readonly Point[])[]): boolean {
	return assessLetter(lesson, strokes).kind === "passed";
}
