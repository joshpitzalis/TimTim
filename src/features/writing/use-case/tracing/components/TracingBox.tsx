import "./feedback.css";
import type { PointerEvent, RefObject } from "react";
import type { Lesson } from "../../../domain/lessons";
import type { Attempt } from "../../../domain/strokes";
import { pointsAttribute } from "../helpers";

export function TracingBox({
	lesson,
	attempt,
	padRef,
	ready,
	onPointerDown,
	onPointerMove,
	onPointerUp,
	onPointerCancel,
	onLostPointerCapture,
}: {
	readonly lesson: Lesson;
	readonly attempt: Attempt;
	readonly padRef: RefObject<SVGSVGElement | null>;
	readonly ready: boolean;
	readonly onPointerDown: (event: PointerEvent<SVGSVGElement>) => void;
	readonly onPointerMove: (event: PointerEvent<SVGSVGElement>) => void;
	readonly onPointerUp: (event: PointerEvent<SVGSVGElement>) => void;
	readonly onPointerCancel: (event: PointerEvent<SVGSVGElement>) => void;
	readonly onLostPointerCapture: (event: PointerEvent<SVGSVGElement>) => void;
}) {
	const { x, y, width, height } = lesson.bounds;
	const viewBox = `${x} ${y} ${width} ${height}`;

	return (
		<div data-writing-result={attempt.feedback} className="relative bg-white text-accent">
			<span
				aria-hidden="true"
				className="pointer-events-none absolute -top-1.25 -left-1.25 z-1 size-4 border-t-3 border-l-3 border-current"
			/>
			<span
				aria-hidden="true"
				className="pointer-events-none absolute -top-1.25 -right-1.25 z-1 size-4 border-t-3 border-r-3 border-current"
			/>
			<span
				aria-hidden="true"
				className="pointer-events-none absolute -bottom-1.25 -left-1.25 z-1 size-4 border-b-3 border-l-3 border-current"
			/>
			<span
				aria-hidden="true"
				className="pointer-events-none absolute -right-1.25 -bottom-1.25 z-1 size-4 border-r-3 border-b-3 border-current"
			/>
			{/* oxlint-disable jsx-a11y/prefer-tag-over-role -- SVG needs an image role while retaining drawing geometry. */}
			<svg
				role="img"
				ref={padRef}
				className="block aspect-square w-full touch-none overflow-hidden border border-line text-accent select-none"
				aria-label="Hindi writing practice area"
				aria-busy={!ready}
				aria-describedby="tracing-note"
				viewBox={viewBox}
				onPointerDown={onPointerDown}
				onPointerMove={onPointerMove}
				onPointerUp={onPointerUp}
				onPointerCancel={onPointerCancel}
				onLostPointerCapture={onLostPointerCapture}
			>
				<path
					className="fill-none stroke-grid stroke-[.2] [stroke-dasharray:1.2_1.2]"
					d={`M ${x + width / 2} ${y} V ${y + height} M ${x} ${y + height / 2} H ${x + width}`}
				/>
				<g className="fill-none stroke-guide stroke-[2.8] [stroke-linecap:round] [stroke-linejoin:round]">
					{lesson.strokes.map((stroke, index) => (
						<polyline key={index} points={pointsAttribute(stroke.points)} />
					))}
				</g>
				<g className="fill-none stroke-accent stroke-[1.3] [stroke-linecap:round] [stroke-linejoin:round]">
					{attempt.strokes.map((stroke, index) => (
						<polyline key={index} points={pointsAttribute(stroke)} />
					))}
					{attempt.active && <polyline points={pointsAttribute(attempt.active.points)} />}
				</g>
			</svg>
			{(attempt.feedback === "correct" || attempt.feedback === "incorrect") && (
				<div
					key={attempt.feedback}
					aria-hidden="true"
					className="pointer-events-none absolute top-4 right-4 grid size-14 place-items-center rounded-full bg-white motion-safe:animate-[result-stamp_550ms_cubic-bezier(0.16,1,0.3,1)]"
				>
					<svg
						viewBox="0 0 32 32"
						className="size-9 fill-none stroke-current stroke-[2.5] [stroke-linecap:round] [stroke-linejoin:round]"
					>
						{attempt.feedback === "correct" ? (
							<path
								d="m7 16 6 6L25 9"
								pathLength="1"
								className="motion-safe:animate-[letter-check_450ms_cubic-bezier(0.16,1,0.3,1)]"
							/>
						) : (
							<path d="M24 11a10 10 0 1 0 1.5 9M24 5v7h-7" />
						)}
					</svg>
				</div>
			)}
			{/* oxlint-enable jsx-a11y/prefer-tag-over-role */}
		</div>
	);
}
