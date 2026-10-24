import type { Attempt, Point } from "../../../domain/strokes";
import { EMPTY } from "./index";

export interface Session {
	readonly attempt: Attempt;
	readonly revealed: boolean;
}

export const INITIAL_SESSION: Session = { attempt: EMPTY, revealed: false };

export type SessionAction =
	| { readonly type: "start"; readonly pointerId: number; readonly point: Point }
	| { readonly type: "extend"; readonly point: Point }
	| { readonly type: "commit"; readonly point: Point }
	| { readonly type: "interrupt" }
	| { readonly type: "reset" }
	| { readonly type: "reveal"; readonly interrupt: boolean };

export function reduceSession(session: Session, action: SessionAction): Session {
	switch (action.type) {
		case "start":
			return {
				...session,
				attempt: {
					...session.attempt,
					active: { pointerId: action.pointerId, points: [action.point] },
					feedback: "drawing",
				},
			};
		case "extend":
			return session.attempt.active
				? {
						...session,
						attempt: {
							...session.attempt,
							active: {
								...session.attempt.active,
								points: [...session.attempt.active.points, action.point],
							},
						},
					}
				: session;
		case "commit":
			return session.attempt.active
				? {
						...session,
						attempt: {
							strokes: [
								...session.attempt.strokes,
								[...session.attempt.active.points, action.point],
							],
							active: null,
							feedback: "ready",
						},
					}
				: session;
		case "interrupt":
			return {
				...session,
				attempt: { ...session.attempt, active: null, feedback: "interrupted" },
			};
		case "reset":
			return INITIAL_SESSION;
		case "reveal":
			if (!action.interrupt) return session.revealed ? session : { ...session, revealed: true };
			return {
				revealed: true,
				attempt: { ...session.attempt, active: null, feedback: "interrupted" },
			};
	}
}

export function feedbackMessage(input: {
	readonly attempt: Attempt;
	readonly revealed: boolean;
	readonly ready: boolean;
}): string {
	const count = input.attempt.strokes.length;
	let feedback = input.revealed
		? "Reference shown. Trace along it, or choose Retry for the faint guide."
		: "Ready to trace. Follow the faint guide.";
	if (count > 0)
		feedback = `${count} ${count === 1 ? "stroke" : "strokes"} drawn. Keep tracing or start again.`;
	if (input.attempt.feedback === "drawing")
		feedback = "Drawing… Lift your finger or pen to finish this stroke.";
	if (input.attempt.feedback === "interrupted")
		feedback = "Stroke interrupted. Your finished strokes are safe. Try again.";
	if (!input.ready) feedback = "Preparing the writing area…";
	return feedback;
}
