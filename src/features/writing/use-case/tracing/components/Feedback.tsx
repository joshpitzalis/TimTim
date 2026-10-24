import "./feedback.css";

export function Feedback({
	message,
	outcome,
}: {
	readonly message: string;
	readonly outcome: string;
}) {
	return (
		<>
			<output
				aria-live="polite"
				data-writing-feedback={outcome}
				className="mt-4 mb-3 block min-h-[3em] text-center text-[.9375rem] text-muted"
			>
				<span key={outcome} className="inline-flex items-center justify-center gap-2">
					{outcome === "correct" && (
						<svg aria-hidden="true" viewBox="0 0 24 24" className="size-6 shrink-0 text-current">
							<path
								d="m5 12 4 4L19 6"
								pathLength="1"
								fill="none"
								stroke="currentColor"
								strokeWidth="2.5"
								strokeLinecap="round"
								strokeLinejoin="round"
								className="motion-safe:animate-[letter-check_420ms_cubic-bezier(0.16,1,0.3,1)]"
							/>
						</svg>
					)}
					{outcome === "incorrect" && (
						<span
							aria-hidden="true"
							className="text-xl text-current motion-safe:animate-[letter-retry_300ms_ease-out]"
						>
							↻
						</span>
					)}
					{message}
				</span>
			</output>
		</>
	);
}
