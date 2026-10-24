export function Controls({
	ready,
	revealed,
	onReset,
	onReveal,
}: {
	readonly ready: boolean;
	readonly revealed: boolean;
	readonly onReset: () => void;
	readonly onReveal: () => void;
}) {
	return (
		<div className="grid grid-cols-[1fr_1.3fr_1fr] gap-2 desktop:gap-3">
			<button
				className="min-h-12 cursor-pointer rounded-lg border border-accent px-2 py-2.5 font-semibold focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ink disabled:cursor-wait disabled:opacity-50 desktop:px-4 bg-white text-accent hover:bg-accent-soft active:bg-accent-pressed"
				type="button"
				disabled={!ready}
				onClick={onReset}
			>
				Clear
			</button>
			<button
				type="button"
				disabled={!ready}
				className="min-h-12 cursor-pointer rounded-lg border border-accent px-2 py-2.5 font-semibold focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ink disabled:cursor-wait disabled:opacity-50 desktop:px-4 bg-accent text-white hover:bg-accent-dark active:bg-accent-pressed"
				onClick={onReveal}
				aria-pressed={revealed}
				aria-controls="stroke-reference"
			>
				Reveal
			</button>
			<button
				className="min-h-12 cursor-pointer rounded-lg border border-accent px-2 py-2.5 font-semibold focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ink disabled:cursor-wait disabled:opacity-50 desktop:px-4 bg-white text-accent hover:bg-accent-soft active:bg-accent-pressed"
				type="button"
				disabled={!ready}
				onClick={onReset}
			>
				Retry
			</button>
		</div>
	);
}
