export function Feedback({ message }: { readonly message: string }) {
	return (
		<>
			<p id="practice-instructions" className="mt-4 mb-1 text-center text-[.9375rem] desktop:mt-5">
				Practice Hindi handwriting with your finger, pen, or mouse.
			</p>
			<output
				aria-live="polite"
				className="mb-3 block min-h-[3em] text-center text-[.9375rem] text-muted"
			>
				{message}
			</output>
		</>
	);
}
