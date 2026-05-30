import type { BookData, QuizData } from '../types';

let bookCache: BookData | null = null;
let quizCache: QuizData | null = null;

export async function loadBookData(): Promise<BookData> {
  if (bookCache) return bookCache;

  const res = await fetch('./content/book.json');
  if (!res.ok) throw new Error(`Failed to load book.json: ${res.status}`);

  bookCache = (await res.json()) as BookData;
  return bookCache;
}

export async function loadQuizData(): Promise<QuizData> {
  if (quizCache) return quizCache;

  const res = await fetch('./content/quiz.json');
  if (!res.ok) throw new Error(`Failed to load quiz.json: ${res.status}`);

  quizCache = (await res.json()) as QuizData;
  return quizCache;
}

/** Load both content files in parallel */
export async function loadAllContent(): Promise<{ book: BookData; quiz: QuizData }> {
  const [book, quiz] = await Promise.all([loadBookData(), loadQuizData()]);
  return { book, quiz };
}

/** Clear in-memory caches — used in tests */
export function clearContentCache(): void {
  bookCache = null;
  quizCache = null;
}
