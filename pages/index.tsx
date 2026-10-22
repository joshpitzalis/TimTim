import { Practice } from "../src/features/practice/browser/practice";

import { DEVELOPMENT_LESSON } from "../src/features/practice/domain/development-lesson";
import { parseLesson } from "../src/features/practice/domain/lesson";

const CONTENT = parseLesson(DEVELOPMENT_LESSON);

export default function HomePage() {
  return <Practice content={CONTENT} />;
}
