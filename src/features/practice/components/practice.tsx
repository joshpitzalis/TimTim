import { useId, useState } from "react";
import type { Lesson, Point } from "../domain/lesson";
import { useDrawing } from "../use-cases/use-drawing";

function pointsAttribute(points: readonly Point[]): string {
	return points.map((point) => `${point.x},${point.y}`).join(" ");
}

export function TracingPractice({ lesson }: { readonly lesson: Lesson }) {
	const {
		padRef,
		ready,
		attempt,
		reset: resetDrawing,
		abort: abortDrawing,
		onPointerDown,
		onPointerMove,
		onPointerUp,
		onPointerCancel,
		onLostPointerCapture,
	} = useDrawing();
	const [revealed, setRevealed] = useState(false);
	const arrowId = useId();
	const { x, y, width, height } = lesson.bounds;
	const viewBox = `${x} ${y} ${width} ${height}`;
	const count = attempt.strokes.length;
	let feedback = revealed
		? "Reference shown. Trace along it, or choose Retry for the faint guide."
		: "Ready to trace. Follow the faint guide.";
	if (count > 0)
		feedback = `${count} ${count === 1 ? "stroke" : "strokes"} drawn. Keep tracing or start again.`;
	if (attempt.feedback === "drawing")
		feedback = "Drawing… Lift your finger or pen to finish this stroke.";
	if (attempt.feedback === "interrupted")
		feedback = "Stroke interrupted. Your finished strokes are safe. Try again.";

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
		<main className="mx-auto max-w-280 px-5 pb-8 desktop:px-8 desktop:pb-12">
			<header className="flex min-h-20 items-center justify-between gap-3 border-b border-line desktop:min-h-18 desktop:gap-4">
				<h1 className="text-2xl leading-[1.15] font-bold tracking-[-.025em] desktop:text-[1.75rem]">
					Strokes
				</h1>
				<p className="max-w-47.5 rounded-md bg-accent-soft px-2 py-1.5 text-xs text-accent-dark desktop:max-w-none desktop:px-3 desktop:py-2 desktop:text-sm">
					Development lesson — review pending
				</p>
			</header>
			<div className="grid grid-cols-[minmax(0,1fr)] items-start gap-8 pt-4 desktop:grid-cols-[minmax(0,460px)_minmax(240px,1fr)] desktop:gap-12">
				<section aria-label="Letter practice">
					<div className="mb-4 flex min-h-18 items-center gap-5 desktop:mb-3 desktop:min-h-16 desktop:gap-6">
						<span
							className="border-r border-line pr-5 text-[3.5rem] leading-none desktop:pr-6 desktop:text-[4rem]"
							lang="hi"
						>
							{lesson.glyph}
						</span>
						<div>
							<span className="text-[1.75rem] leading-[1.15] desktop:text-[2rem]">
								{lesson.pronunciation}
							</span>
							<p className="mt-1 text-sm text-muted">Hindi letter practice</p>
						</div>
					</div>
					<div className="relative bg-white">
						<span
							aria-hidden="true"
							className="pointer-events-none absolute -top-1.25 -left-1.25 z-1 size-4 border-t-3 border-l-3 border-accent"
						/>
						<span
							aria-hidden="true"
							className="pointer-events-none absolute -top-1.25 -right-1.25 z-1 size-4 border-t-3 border-r-3 border-accent"
						/>
						<span
							aria-hidden="true"
							className="pointer-events-none absolute -bottom-1.25 -left-1.25 z-1 size-4 border-b-3 border-l-3 border-accent"
						/>
						<span
							aria-hidden="true"
							className="pointer-events-none absolute -right-1.25 -bottom-1.25 z-1 size-4 border-r-3 border-b-3 border-accent"
						/>
						{/* oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- SVG needs an image role while retaining drawing geometry. */}
						<svg role="img"
							ref={padRef}
							className="block aspect-square w-full touch-none overflow-hidden border border-line text-accent select-none"
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
							<defs>
								<marker
									id={arrowId}
									viewBox="0 0 10 10"
									refX="8"
									refY="5"
									markerWidth="4"
									markerHeight="4"
									orient="auto-start-reverse"
								>
									<path
										d="M 0 1 L 8 5 L 0 9"
										fill="none"
										stroke="currentColor"
										strokeWidth="1.5"
									/>
								</marker>
							</defs>
							<path
								className="fill-none stroke-grid stroke-[.2] [stroke-dasharray:1.2_1.2]"
								d={`M ${x + width / 2} ${y} V ${y + height} M ${x} ${y + height / 2} H ${x + width}`}
							/>
							<g
								className={
									revealed
										? "fill-none stroke-accent stroke-[1.6] [stroke-linecap:round] [stroke-linejoin:round]"
										: "fill-none stroke-guide stroke-[2.8] [stroke-linecap:round] [stroke-linejoin:round]"
								}
							>
								{lesson.strokes.map((stroke, index) => (
									<polyline
										key={index}
										points={pointsAttribute(stroke.points)}
										markerEnd={revealed ? `url(#${arrowId})` : undefined}
									/>
								))}
							</g>
							<g className="fill-none stroke-accent stroke-[1.3] [stroke-linecap:round] [stroke-linejoin:round]">
								{attempt.strokes.map((stroke, index) => (
									<polyline key={index} points={pointsAttribute(stroke)} />
								))}
								{attempt.active && (
									<polyline points={pointsAttribute(attempt.active.points)} />
								)}
							</g>
							{revealed &&
								lesson.strokes.map((stroke, index) => (
									<g key={index}>
										<circle
											className="fill-accent"
											cx={stroke.points[0].x - 5}
											cy={stroke.points[0].y - 5}
											r="3.4"
										/>
										<text
											className="fill-white font-sans text-[4px]"
											x={stroke.points[0].x - 5}
											y={stroke.points[0].y - 5}
											dy=".35em"
											textAnchor="middle"
										>
											{index + 1}
										</text>
									</g>
								))}
						</svg>
					</div>
					<p
						id="practice-instructions"
						className="mt-4 mb-1 text-center text-[.9375rem] desktop:mt-5"
					>
						Practice Hindi handwriting with your finger, pen, or mouse.
					</p>
					<output
						aria-live="polite"
						className="mb-3 block min-h-[3em] text-center text-[.9375rem] text-muted"
					>
						{feedback}
					</output>
					<div className="grid grid-cols-[1fr_1.3fr_1fr] gap-2 desktop:gap-3">
						<button
							className="min-h-12 cursor-pointer rounded-lg border border-accent px-2 py-2.5 font-semibold focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ink disabled:cursor-wait disabled:opacity-50 desktop:px-4 bg-white text-accent hover:bg-accent-soft active:bg-accent-pressed"
							type="button"
							disabled={!ready}
							onClick={reset}
						>
							Clear
						</button>
						<button
							type="button"
							disabled={!ready}
							className="min-h-12 cursor-pointer rounded-lg border border-accent px-2 py-2.5 font-semibold focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ink disabled:cursor-wait disabled:opacity-50 desktop:px-4 bg-accent text-white hover:bg-accent-dark active:bg-accent-pressed"
							onClick={reveal}
							aria-pressed={revealed}
							aria-controls="stroke-reference"
						>
							Reveal
						</button>
						<button
							className="min-h-12 cursor-pointer rounded-lg border border-accent px-2 py-2.5 font-semibold focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ink disabled:cursor-wait disabled:opacity-50 desktop:px-4 bg-white text-accent hover:bg-accent-soft active:bg-accent-pressed"
							type="button"
							disabled={!ready}
							onClick={reset}
						>
							Retry
						</button>
					</div>
				</section>
				<aside
					className="max-w-85 desktop:pt-19"
					aria-label="Practice guidance"
				>
					<div>
						<h2 className="mb-2 text-lg leading-[1.35] font-[650]">
							{revealed ? "Stroke reference" : "Take it one stroke at a time"}
						</h2>
						<p id="tracing-note" className="text-muted">
							Tracing only. Your writing is not checked or scored.
						</p>
					</div>
					<div id="stroke-reference">
						{revealed ? (
							<ol className="my-6 list-none p-0">
								{lesson.strokes.map((stroke, index) => (
									<li
										key={index}
										className="grid grid-cols-[28px_1fr] gap-3 border-t border-line py-4"
									>
										<span
											className="grid h-7 place-items-center rounded-full bg-accent font-[650] text-white"
											aria-hidden="true"
										>
											{index + 1}
										</span>
										<div>
											<svg
												aria-hidden="true"
												viewBox={viewBox}
												className="block size-20"
											>
												<g className="fill-none stroke-guide stroke-[2.8] [stroke-linecap:round] [stroke-linejoin:round]">
													{lesson.strokes.map((reference, referenceIndex) => (
														<polyline
															key={referenceIndex}
															points={pointsAttribute(reference.points)}
														/>
													))}
												</g>
												<polyline
													className="fill-none stroke-accent stroke-[1.3] [stroke-linecap:round] [stroke-linejoin:round]"
													points={pointsAttribute(stroke.points)}
												/>
											</svg>
											<p className="mt-2 text-[.9375rem]">{stroke.hint}</p>
										</div>
									</li>
								))}
							</ol>
						) : (
							<p className="my-6">
								Follow the faint guide. Use Reveal when you want to see each
								stroke’s start, direction, and order.
							</p>
						)}
					</div>
					<p className="mt-6 mb-3 text-sm text-muted">
						This original template still needs a Hindi writer or teacher to
						review its shape and teaching sequence.
					</p>
					<p className="border-t border-line pt-4 text-sm text-muted">
						Your ink stays on this page. Leaving or refreshing clears it.
					</p>
				</aside>
			</div>
		</main>
	);
}
