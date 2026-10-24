export function Controls({
	ready,
	canCheck,
	onCheck,
	onReset,
}: {
	readonly ready: boolean;
	readonly canCheck: boolean;
	readonly onCheck: () => void;
	readonly onReset: () => void;
}) {
	return (
		<div className="grid grid-cols-2 gap-2 desktop:gap-3">
			<button
				className="min-h-12 cursor-pointer rounded-lg border border-accent px-2 py-2.5 font-semibold focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ink disabled:cursor-wait disabled:opacity-50 desktop:px-4 bg-accent text-white hover:bg-accent-dark active:bg-accent-dark"
				type="button"
				disabled={!ready || !canCheck}
				onClick={onCheck}
			>
				Check
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
