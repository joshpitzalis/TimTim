import { expect, test } from "vitest";
import { EMPTY } from "../../use-cases/tracing/helpers";
import {
	type Session,
	type SessionAction,
	INITIAL_SESSION,
	feedbackMessage,
	reduceSession,
} from "../../use-cases/tracing/session";

const a = { x: 10, y: 20 };
const b = { x: 30, y: 40 };
const c = { x: 50, y: 60 };

function apply(actions: readonly SessionAction[], session: Session = INITIAL_SESSION): Session {
	return actions.reduce(reduceSession, session);
}

test("a stroke starts, extends, and commits without clearing the reference", () => {
	const revealed = reduceSession(INITIAL_SESSION, { type: "reveal", interrupt: false });
	const committed = apply(
		[
			{ type: "start", pointerId: 1, point: a },
			{ type: "extend", point: b },
			{ type: "commit", point: c },
		],
		revealed,
	);

	expect(committed.revealed).toBe(true);
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

test("reveal keeps finished strokes and only interrupts an active stroke", () => {
	const drawing = apply([
		{ type: "start", pointerId: 1, point: a },
		{ type: "commit", point: b },
		{ type: "start", pointerId: 2, point: c },
	]);
	const shown = reduceSession(drawing, { type: "reveal", interrupt: true });

	expect(shown.revealed).toBe(true);
	expect(shown.attempt.strokes).toEqual([[a, b]]);
	expect(shown.attempt.active).toBeNull();
	expect(shown.attempt.feedback).toBe("interrupted");
});

test("reset clears the attempt and the reference together", () => {
	const session = apply([
		{ type: "reveal", interrupt: false },
		{ type: "start", pointerId: 1, point: a },
		{ type: "commit", point: b },
		{ type: "reset" },
	]);

	expect(session).toBe(INITIAL_SESSION);
	expect(session.attempt).toBe(EMPTY);
});

test("feedback follows readiness, then the stroke, then how much is drawn", () => {
	const idle = INITIAL_SESSION;
	const revealed = reduceSession(idle, { type: "reveal", interrupt: false });
	const drawn = apply(
		[
			{ type: "start", pointerId: 1, point: a },
			{ type: "commit", point: b },
		],
		revealed,
	);
	const drawing = reduceSession(drawn, { type: "start", pointerId: 3, point: c });
	const interrupted = reduceSession(drawing, { type: "interrupt" });

	expect(feedbackMessage({ ...idle, ready: false })).toBe("Preparing the writing area…");
	expect(feedbackMessage({ ...idle, ready: true })).toBe("Ready to trace. Follow the faint guide.");
	expect(feedbackMessage({ ...revealed, ready: true })).toBe(
		"Reference shown. Trace along it, or choose Retry for the faint guide.",
	);
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
