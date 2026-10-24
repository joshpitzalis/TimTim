import { useId } from "react";
import type { PointerEvent, RefObject } from "react";
import type { Lesson } from "../../../domain/lessons";
import type { Attempt } from "../../../domain/strokes";
import { pointsAttribute } from "../helpers";

export function TracingBox({
	lesson,
	attempt,
	padRef,
	ready,
	revealed,
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
	readonly revealed: boolean;
	readonly onPointerDown: (event: PointerEvent<SVGSVGElement>) => void;
	readonly onPointerMove: (event: PointerEvent<SVGSVGElement>) => void;
	readonly onPointerUp: (event: PointerEvent<SVGSVGElement>) => void;
	readonly onPointerCancel: (event: PointerEvent<SVGSVGElement>) => void;
	readonly onLostPointerCapture: (event: PointerEvent<SVGSVGElement>) => void;
}) {
	const arrowId = useId();
	const { x, y, width, height } = lesson.bounds;
	const viewBox = `${x} ${y} ${width} ${height}`;

	return (
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
			{/* oxlint-disable jsx-a11y/prefer-tag-over-role -- SVG needs an image role while retaining drawing geometry. */}
			<svg
				role="img"
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
						<path d="M 0 1 L 8 5 L 0 9" fill="none" stroke="currentColor" strokeWidth="1.5" />
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
					{attempt.active && <polyline points={pointsAttribute(attempt.active.points)} />}
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
			{/* oxlint-enable jsx-a11y/prefer-tag-over-role */}
		</div>
	);
}
