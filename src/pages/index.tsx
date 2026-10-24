import "../styles.css";
import { DEVELOPMENT_LESSON } from "../features/practice/domain/development-lesson";
import {
	type LessonContent,
	parseLesson,
} from "../features/practice/domain/lesson";
import { TracingPractice } from "../features/practice/components/practice";

const CONTENT = parseLesson(DEVELOPMENT_LESSON);

export default function HomePage() {
	return <Practice content={CONTENT} />;
}

export function Practice({ content }: { readonly content: LessonContent }) {
	if (content.kind === "unusable") {
		return (
			<main className="mx-auto max-w-280 px-5 pb-8 desktop:px-8 desktop:pb-12">
				<h1 className="text-2xl leading-[1.15] font-bold tracking-[-.025em] desktop:text-[1.75rem]">
					Strokes
				</h1>
				<section role="alert">
					<h2 className="mb-2 text-lg leading-[1.35] font-[650]">
						Lesson unavailable
					</h2>
					<p>{content.message}</p>
					<p>
						Your writing has not been checked. Reload the page to try again.
					</p>
				</section>
			</main>
		);
	}
	return <TracingPractice lesson={content.lesson} />;
}
