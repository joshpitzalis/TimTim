export function Header({
	glyph,
	pronunciation,
}: {
	readonly glyph: string;
	readonly pronunciation: string;
}) {
	return (
		<div className="mb-4 flex min-h-18 items-center gap-5 desktop:mb-3 desktop:min-h-16 desktop:gap-6">
			<span
				className="border-r border-line pr-5 text-[3.5rem] leading-none desktop:pr-6 desktop:text-[4rem]"
				lang="hi"
			>
				{glyph}
			</span>
			<div>
				<span className="text-[1.75rem] leading-[1.15] desktop:text-[2rem]">{pronunciation}</span>
				<p className="mt-1 text-sm text-muted">Hindi letter practice</p>
			</div>
		</div>
	);
}
