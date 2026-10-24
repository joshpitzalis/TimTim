import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import type { PointerEvent } from "react";
import type { Capture, Drawing } from "../../../domain/strokes";
import { sameMatrix, toPoint } from "../helpers";
import { INITIAL_SESSION, reduceSession } from "../helpers/session";

export function useDrawing(): Drawing {
	const padRef = useRef<SVGSVGElement>(null);
	const captureRef = useRef<Capture | null>(null);
	const [ready, setReady] = useState(false);
	const [session, dispatch] = useReducer(reduceSession, INITIAL_SESSION);

	const release = useCallback((): void => {
		const capture = captureRef.current;
		captureRef.current = null;
		const pad = padRef.current;
		if (capture && pad?.hasPointerCapture(capture.pointerId))
			pad.releasePointerCapture(capture.pointerId);
	}, []);

	const abort = useCallback((): void => {
		if (!captureRef.current) return;
		release();
		dispatch({ type: "interrupt" });
	}, [release]);

	useEffect(() => {
		const pad = padRef.current;
		if (!pad) return;
		const observer = new ResizeObserver(() => {
			const capture = captureRef.current;
			const matrix = pad.getScreenCTM();
			if (capture && (!matrix || !sameMatrix(capture.matrix, matrix))) abort();
		});
		observer.observe(pad);
		setReady(true);
		const onVisibilityChange = (): void => {
			if (document.hidden) abort();
		};
		window.addEventListener("blur", abort);
		document.addEventListener("visibilitychange", onVisibilityChange);
		window.addEventListener("resize", abort);
		window.addEventListener("scroll", abort, true);
		window.visualViewport?.addEventListener("resize", abort);
		window.visualViewport?.addEventListener("scroll", abort);
		return () => {
			observer.disconnect();
			window.removeEventListener("blur", abort);
			document.removeEventListener("visibilitychange", onVisibilityChange);
			window.removeEventListener("resize", abort);
			window.removeEventListener("scroll", abort, true);
			window.visualViewport?.removeEventListener("resize", abort);
			window.visualViewport?.removeEventListener("scroll", abort);
			release();
		};
	}, [abort, release]);

	function onPointerDown(event: PointerEvent<SVGSVGElement>): void {
		if (!ready || captureRef.current || event.button !== 0) return;
		const mapped = toPoint(event.currentTarget, event.clientX, event.clientY);
		if (!mapped) return;
		event.currentTarget.setPointerCapture(event.pointerId);
		captureRef.current = { pointerId: event.pointerId, matrix: mapped.matrix };
		dispatch({ type: "start", pointerId: event.pointerId, point: mapped.point });
	}

	function onPointerMove(event: PointerEvent<SVGSVGElement>): void {
		const capture = captureRef.current;
		if (!capture || event.pointerId !== capture.pointerId) return;
		const mapped = toPoint(event.currentTarget, event.clientX, event.clientY);
		if (!mapped || !sameMatrix(capture.matrix, mapped.matrix)) return abort();
		dispatch({ type: "extend", point: mapped.point });
	}

	function onPointerUp(event: PointerEvent<SVGSVGElement>): void {
		const capture = captureRef.current;
		if (!capture || event.pointerId !== capture.pointerId) return;
		const mapped = toPoint(event.currentTarget, event.clientX, event.clientY);
		if (!mapped || !sameMatrix(capture.matrix, mapped.matrix)) return abort();
		release();
		dispatch({ type: "commit", point: mapped.point });
	}

	function onInterrupted(event: PointerEvent<SVGSVGElement>): void {
		if (event.pointerId === captureRef.current?.pointerId) abort();
	}

	function reset(): void {
		release();
		dispatch({ type: "reset" });
	}

	function reveal(): void {
		const interrupt = captureRef.current !== null;
		if (interrupt) release();
		dispatch({ type: "reveal", interrupt });
	}

	return {
		padRef,
		ready,
		attempt: session.attempt,
		revealed: session.revealed,
		reset,
		reveal,
		abort,
		onPointerDown,
		onPointerMove,
		onPointerUp,
		onPointerCancel: onInterrupted,
		onLostPointerCapture: onInterrupted,
	};
}
