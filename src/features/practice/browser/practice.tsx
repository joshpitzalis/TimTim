import { useId, useState } from "react";
import type { Lesson, LessonContent, Point } from "../domain/lesson";
import { useDrawing } from "./use-drawing";
import "./practice.css";

function pointsAttribute(points: readonly Point[]): string {
  return points.map((point) => `${point.x},${point.y}`).join(" ");
}

export function Practice({ content }: { readonly content: LessonContent }) {
  if (content.kind === "unusable") {
    return <main className="practice-app"><h1>Strokes</h1><section role="alert"><h2>Lesson unavailable</h2><p>{content.message}</p><p>Your writing has not been checked. Reload the page to try again.</p></section></main>;
  }
  return <TracingPractice lesson={content.lesson} />;
}

function TracingPractice({ lesson }: { readonly lesson: Lesson }) {
  const { padRef, ready, attempt, reset: resetDrawing, abort: abortDrawing, onPointerDown, onPointerMove, onPointerUp, onPointerCancel, onLostPointerCapture } = useDrawing();
  const [revealed, setRevealed] = useState(false);
  const arrowId = useId();
  const { x, y, width, height } = lesson.bounds;
  const viewBox = `${x} ${y} ${width} ${height}`;
  const count = attempt.strokes.length;
  let feedback = revealed ? "Reference shown. Trace along it, or choose Retry for the faint guide." : "Ready to trace. Follow the faint guide.";
  if (count > 0) feedback = `${count} ${count === 1 ? "stroke" : "strokes"} drawn. Keep tracing or start again.`;
  if (attempt.feedback === "drawing") feedback = "Drawing… Lift your finger or pen to finish this stroke.";
  if (attempt.feedback === "interrupted") feedback = "Stroke interrupted. Your finished strokes are safe. Try again.";

  if (!ready) feedback = "Preparing the writing area…";

  function reset(): void {
    resetDrawing();
    setRevealed(false);
  }

  function reveal(): void {
    abortDrawing();
    setRevealed(true);
  }

  return (
    <main className="practice-app">
      <header className="app-header">
        <h1>Strokes</h1>
        <p className="review-notice">Development lesson — review pending</p>
      </header>
      <div className="practice-layout">
        <section className="workspace" aria-label="Letter practice">
          <div className="lesson-identity"><span className="lesson-glyph" lang="hi">{lesson.glyph}</span><div><span className="pronunciation">{lesson.pronunciation}</span><p>Hindi letter practice</p></div></div>
          <div className="pad-frame">
            {/* oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- SVG needs an image role while retaining drawing geometry. */}
            <svg role="img"
              ref={padRef}
              className="writing-pad"
              aria-label="Hindi writing practice area"
              aria-busy={!ready}
              aria-describedby="practice-instructions tracing-note"
              viewBox={viewBox}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerCancel}
              onLostPointerCapture={onLostPointerCapture}
            >
              <defs><marker id={arrowId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M 0 1 L 8 5 L 0 9" fill="none" stroke="currentColor" strokeWidth="1.5" /></marker></defs>
              <path className="registration-grid" d={`M ${x + width / 2} ${y} V ${y + height} M ${x} ${y + height / 2} H ${x + width}`} />
              <g className={revealed ? "reference revealed" : "reference"}>
                {lesson.strokes.map((stroke, index) => <polyline key={index} points={pointsAttribute(stroke.points)} markerEnd={revealed ? `url(#${arrowId})` : undefined} />)}
              </g>
              <g className="learner-ink">
                {attempt.strokes.map((stroke, index) => <polyline key={index} points={pointsAttribute(stroke)} />)}
                {attempt.active && <polyline points={pointsAttribute(attempt.active.points)} />}
              </g>
              {revealed && lesson.strokes.map((stroke, index) => <g key={index} className="stroke-number"><circle cx={stroke.points[0].x - 5} cy={stroke.points[0].y - 5} r="3.4" /><text x={stroke.points[0].x - 5} y={stroke.points[0].y - 5} dy=".35em" textAnchor="middle">{index + 1}</text></g>)}
            </svg>
          </div>
          <p id="practice-instructions" className="pad-instructions">Practice Hindi handwriting with your finger, pen, or mouse.</p>
          <output aria-live="polite" className="practice-status">{feedback}</output>
          <div className="practice-controls">
            <button type="button" disabled={!ready} onClick={reset}>Clear</button>
            <button type="button" disabled={!ready} className="primary" onClick={reveal} aria-pressed={revealed} aria-controls="stroke-reference">Reveal</button>
            <button type="button" disabled={!ready} onClick={reset}>Retry</button>
          </div>
        </section>
        <aside className="reference-rail" aria-label="Practice guidance">
          <div className="rail-intro"><h2>{revealed ? "Stroke reference" : "Take it one stroke at a time"}</h2><p id="tracing-note">Tracing only. Your writing is not checked or scored.</p></div>
          <div id="stroke-reference">
            {revealed ? <ol className="stroke-list">{lesson.strokes.map((stroke, index) => <li key={index}><span className="sequence-number" aria-hidden="true">{index + 1}</span><div><svg aria-hidden="true" viewBox={viewBox} className="stroke-preview"><g className="reference">{lesson.strokes.map((reference, referenceIndex) => <polyline key={referenceIndex} points={pointsAttribute(reference.points)} />)}</g><polyline className="preview-ink" points={pointsAttribute(stroke.points)} /></svg><p>{stroke.hint}</p></div></li>)}</ol> : <p className="reveal-instruction">Follow the faint guide. Use Reveal when you want to see each stroke’s start, direction, and order.</p>}
          </div>
          <p className="lesson-review">This original template still needs a Hindi writer or teacher to review its shape and teaching sequence.</p>
          <p className="privacy-note">Your ink stays on this page. Leaving or refreshing clears it.</p>
        </aside>
      </div>
    </main>
  );
}
