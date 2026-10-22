import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent, RefObject } from "react";
import type { Point } from "../domain/lesson";

interface ActiveStroke {
  readonly pointerId: number;
  readonly points: readonly Point[];
}
interface Attempt {
  readonly strokes: readonly (readonly Point[])[];
  readonly active: ActiveStroke | null;
  readonly feedback: "ready" | "drawing" | "interrupted";
}
interface Capture {
  readonly pointerId: number;
  readonly matrix: DOMMatrix;
}
interface Drawing {
  readonly padRef: RefObject<SVGSVGElement | null>;
  readonly ready: boolean;
  readonly attempt: Attempt;
  readonly reset: () => void;
  readonly abort: () => void;
  readonly onPointerDown: (event: PointerEvent<SVGSVGElement>) => void;
  readonly onPointerMove: (event: PointerEvent<SVGSVGElement>) => void;
  readonly onPointerUp: (event: PointerEvent<SVGSVGElement>) => void;
  readonly onPointerCancel: (event: PointerEvent<SVGSVGElement>) => void;
  readonly onLostPointerCapture: (event: PointerEvent<SVGSVGElement>) => void;
}
const EMPTY: Attempt = { strokes: [], active: null, feedback: "ready" };

function sameMatrix(left: DOMMatrix, right: DOMMatrix): boolean {
  return left.a === right.a && left.b === right.b && left.c === right.c && left.d === right.d && left.e === right.e && left.f === right.f;
}
function toPoint(svg: SVGSVGElement, x: number, y: number): { readonly point: Point; readonly matrix: DOMMatrix } | null {
  const matrix = svg.getScreenCTM();
  if (!matrix || matrix.a * matrix.d - matrix.b * matrix.c === 0) return null;
  const point = new DOMPoint(x, y).matrixTransform(matrix.inverse());
  if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) return null;
  return { point: { x: point.x, y: point.y }, matrix };
}

export function useDrawing(): Drawing {
  const padRef = useRef<SVGSVGElement>(null);
  const captureRef = useRef<Capture | null>(null);
  const [ready, setReady] = useState(false);
  const [attempt, setAttempt] = useState<Attempt>(EMPTY);

  const release = useCallback((): void => {
    const capture = captureRef.current;
    captureRef.current = null;
    const pad = padRef.current;
    if (capture && pad?.hasPointerCapture(capture.pointerId)) pad.releasePointerCapture(capture.pointerId);
  }, []);

  const abort = useCallback((): void => {
    if (!captureRef.current) return;
    release();
    setAttempt((previous) => ({ ...previous, active: null, feedback: "interrupted" }));
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
    const onVisibilityChange = (): void => { if (document.hidden) abort(); };
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
    setAttempt((previous) => ({ ...previous, active: { pointerId: event.pointerId, points: [mapped.point] }, feedback: "drawing" }));
  }

  function onPointerMove(event: PointerEvent<SVGSVGElement>): void {
    const capture = captureRef.current;
    if (!capture || event.pointerId !== capture.pointerId) return;
    const mapped = toPoint(event.currentTarget, event.clientX, event.clientY);
    if (!mapped || !sameMatrix(capture.matrix, mapped.matrix)) return abort();
    setAttempt((previous) => previous.active ? { ...previous, active: { ...previous.active, points: [...previous.active.points, mapped.point] } } : previous);
  }

  function onPointerUp(event: PointerEvent<SVGSVGElement>): void {
    const capture = captureRef.current;
    if (!capture || event.pointerId !== capture.pointerId) return;
    const mapped = toPoint(event.currentTarget, event.clientX, event.clientY);
    if (!mapped || !sameMatrix(capture.matrix, mapped.matrix)) return abort();
    release();
    setAttempt((previous) => previous.active ? { strokes: [...previous.strokes, [...previous.active.points, mapped.point]], active: null, feedback: "ready" } : previous);
  }

  function onInterrupted(event: PointerEvent<SVGSVGElement>): void {
    if (event.pointerId === captureRef.current?.pointerId) abort();
  }

  function reset(): void {
    release();
    setAttempt(EMPTY);
  }

  return { padRef, ready, attempt, reset, abort, onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onInterrupted, onLostPointerCapture: onInterrupted };
}
