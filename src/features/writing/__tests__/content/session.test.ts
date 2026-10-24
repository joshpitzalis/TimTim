import { expect, test } from "vitest";
import { DEVELOPMENT_LESSON } from "../../use-case/tracing/constants/development-lesson";
import { parseLesson } from "../../use-case/tracing/helpers";
import { EMPTY } from "../../use-case/tracing/helpers";
import {
	type Session,
	type SessionAction,
	INITIAL_SESSION,
	feedbackMessage,
	reduceSession,
} from "../../use-case/tracing/helpers/session";

const a = { x: 10, y: 20 };
const b = { x: 30, y: 40 };
const c = { x: 50, y: 60 };

function apply(actions: readonly SessionAction[], session: Session = INITIAL_SESSION): Session {
	return actions.reduce(reduceSession, session);
}

test("a stroke starts, extends, and commits", () => {
	const committed = apply([
		{ type: "start", pointerId: 1, point: a },
		{ type: "extend", point: b },
		{ type: "commit", point: c },
	]);

	expect(committed.attempt).toEqual({
		strokes: [[a, b, c]],
		active: null,
		feedback: "ready",
	});
});

test("extend and commit leave a session unchanged when no stroke is active", () => {
	expect(reduceSession(INITIAL_SESSION, { type: "extend", point: a })).toBe(INITIAL_SESSION);
	expect(reduceSession(INITIAL_SESSION, { type: "commit", point: a })).toBe(INITIAL_SESSION);
});

test("reset clears the attempt", () => {
	const session = apply([
		{ type: "start", pointerId: 1, point: a },
		{ type: "commit", point: b },
		{ type: "reset" },
	]);

	expect(session).toBe(INITIAL_SESSION);
	expect(session.attempt).toBe(EMPTY);
});

test("feedback follows readiness, then the stroke, then how much is drawn", () => {
	const idle = INITIAL_SESSION;
	const drawn = apply([
		{ type: "start", pointerId: 1, point: a },
		{ type: "commit", point: b },
	]);
	const drawing = reduceSession(drawn, { type: "start", pointerId: 3, point: c });
	const interrupted = reduceSession(drawing, { type: "interrupt" });

	expect(feedbackMessage({ ...idle, ready: false })).toBe("Preparing the writing area…");
	expect(feedbackMessage({ ...idle, ready: true })).toBe("Ready to trace. Follow the faint guide.");
	expect(feedbackMessage({ ...drawn, ready: true })).toBe(
		"1 stroke drawn. Keep tracing or start again.",
	);
	expect(feedbackMessage({ ...drawing, ready: true })).toBe(
		"Drawing… Lift your finger or pen to finish this stroke.",
	);
	expect(feedbackMessage({ ...interrupted, ready: true })).toBe(
		"Stroke interrupted. Your finished strokes are safe. Try again.",
	);
	expect(feedbackMessage({ ...interrupted, ready: false })).toBe("Preparing the writing area…");
});

test("checking ignores empty and active attempts, and drawing or retry clears the result", () => {
	const content = parseLesson(DEVELOPMENT_LESSON);
	if (content.kind !== "ready") throw new Error("Invalid lesson");
	const action: SessionAction = { type: "check", lesson: content.lesson };
	expect(reduceSession(INITIAL_SESSION, action)).toBe(INITIAL_SESSION);
	const drawing = reduceSession(INITIAL_SESSION, { type: "start", pointerId: 1, point: a });
	expect(reduceSession(drawing, action)).toBe(drawing);
	const committed = reduceSession(drawing, { type: "commit", point: b });
	const checked = reduceSession(committed, action);
	expect(checked.attempt.feedback).toBe("incorrect");
	expect(reduceSession(checked, { type: "start", pointerId: 2, point: c }).attempt.feedback).toBe(
		"drawing",
	);
	expect(reduceSession(checked, { type: "reset" })).toBe(INITIAL_SESSION);
});
