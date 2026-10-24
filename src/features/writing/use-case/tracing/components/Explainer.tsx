import type { Lesson } from "../../../domain/lessons";
import { pointsAttribute } from "../helpers";

export function Explainer({
	lesson,
	revealed,
}: {
	readonly lesson: Lesson;
	readonly revealed: boolean;
}) {
	const { x, y, width, height } = lesson.bounds;
	const viewBox = `${x} ${y} ${width} ${height}`;

	return (
		<aside className="max-w-85 desktop:pt-19" aria-label="Practice guidance">
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
							<li key={index} className="grid grid-cols-[28px_1fr] gap-3 border-t border-line py-4">
								<span
									className="grid h-7 place-items-center rounded-full bg-accent font-[650] text-white"
									aria-hidden="true"
								>
									{index + 1}
								</span>
								<div>
									<svg aria-hidden="true" viewBox={viewBox} className="block size-20">
										<g className="fill-none stroke-guide stroke-[2.8] [stroke-linecap:round] [stroke-linejoin:round]">
											{lesson.strokes.map((reference, referenceIndex) => (
												<polyline key={referenceIndex} points={pointsAttribute(reference.points)} />
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
						Follow the faint guide. Use Reveal when you want to see each stroke’s start, direction,
						and order.
					</p>
				)}
			</div>
			<p className="mt-6 mb-3 text-sm text-muted">
				This original template still needs a Hindi writer or teacher to review its shape and
				teaching sequence.
			</p>
			<p className="border-t border-line pt-4 text-sm text-muted">
				Your ink stays on this page. Leaving or refreshing clears it.
			</p>
		</aside>
	);
}
