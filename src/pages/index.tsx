import "../styles.css";
import type { Lesson } from "../features/writing/domain/lessons";
import {
	Controls,
	DEVELOPMENT_LESSON,
	Explainer,
	Feedback,
	Header,
	TracingBox,
	feedbackMessage,
	parseLesson,
	useDrawing,
} from "../features/writing/use-case/tracing";

export default function HomePage() {
	const content = parseLesson(DEVELOPMENT_LESSON);
	if (content.kind === "unusable") {
		return <ErrorBox message={content.message} />;
	}
	return <PracticeArea lesson={content.lesson} />;
}

export function PracticeArea({ lesson }: { readonly lesson: Lesson }) {
	const drawing = useDrawing(lesson);
	const feedback = feedbackMessage({
		attempt: drawing.attempt,
		ready: drawing.ready,
	});

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
					<Header glyph={lesson.glyph} pronunciation={lesson.pronunciation} />
					<TracingBox
						lesson={lesson}
						attempt={drawing.attempt}
						padRef={drawing.padRef}
						ready={drawing.ready}
						onPointerDown={drawing.onPointerDown}
						onPointerMove={drawing.onPointerMove}
						onPointerUp={drawing.onPointerUp}
						onPointerCancel={drawing.onPointerCancel}
						onLostPointerCapture={drawing.onLostPointerCapture}
					/>
					<Feedback message={feedback} outcome={drawing.attempt.feedback} />
					<Controls
						ready={drawing.ready}
						canCheck={drawing.attempt.strokes.length > 0 && !drawing.attempt.active}
						onCheck={drawing.check}
						onReset={drawing.reset}
					/>
				</section>
				<Explainer />
			</div>
		</main>
	);
}

export function ErrorBox({ message }: { readonly message: string }) {
	return (
		<main className="mx-auto max-w-280 px-5 pb-8 desktop:px-8 desktop:pb-12">
			<h1 className="text-2xl leading-[1.15] font-bold tracking-[-.025em] desktop:text-[1.75rem]">
				Strokes
			</h1>
			<section role="alert">
				<h2 className="mb-2 text-lg leading-[1.35] font-[650]">Lesson unavailable</h2>
				<p>{message}</p>
				<p>Your writing has not been checked. Reload the page to try again.</p>
			</section>
		</main>
	);
}
