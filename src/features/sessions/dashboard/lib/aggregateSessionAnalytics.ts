import { isAnswerCorrect } from "@/features/stats/lib/computeTestResult";
import type { TestResult } from "@/features/stats/type/testResult";
import type { TestTrace } from "@/features/stats/type/testTrace";
import type { Question } from "@/features/tests/types/question";
import type { SessionResultRow } from "@/lib/supabase/sessionResults";

import {
  formatOptionLabel,
  formatOptionLabels,
} from "./formatOptionLabel";

export type QuestionCountRow = {
  questionId: string;
  questionText: string;
  count: number;
};

export type SequenceStep = {
  stepNumber: number;
  attemptedIndex: number;
  questionId: string;
  questionText: string;
  selectedOptionIndices: number[];
  selectedOptionLabels: string;
  isSkipped: boolean;
};

export type DifficultyRow = {
  questionId: string;
  questionText: string;
  attempts: number;
  correct: number;
  incorrect: number;
  skipped: number;
  correctRatePercent: number;
};

export type PopularWrongRow = {
  questionId: string;
  questionText: string;
  totalAttempts: number;
  optionIndex: number;
  optionText: string;
  wrongPickCount: number;
};

export type SessionAnalytics = {
  studentCount: number;
  averageScorePercent: number;
  averageTimeMs: number;
  mostFailed: QuestionCountRow[];
  mostCorrect: QuestionCountRow[];
  mostSkipped: QuestionCountRow[];
  averageSequence: SequenceStep[];
  longestSequence: SequenceStep[];
  shortestSequence: SequenceStep[];
  top10Hardest: DifficultyRow[];
  top10Easiest: DifficultyRow[];
  popularWrongAnswers: PopularWrongRow[];
};

type TraceAnswer = TestTrace["answers"][number];

const MIN_ATTEMPTS_FOR_DIFFICULTY = 1;
const POPULAR_QUESTION_MIN_ATTEMPTS = 2;

function questionText(
  questionsById: Map<string, Question>,
  questionId: string,
): string {
  return questionsById.get(questionId)?.text ?? questionId;
}

export function scorePercentFromResult(result: TestResult): number {
  const totalAnswers =
    result.incorrectAnswers + result.skippedAnswers + result.correctAnswers;
  if (totalAnswers === 0 || result.correctAnswers === 0) {
    return 0;
  }
  return Math.round((result.correctAnswers * 100) / totalAnswers);
}

function sortByAttemptedIndex(answers: TraceAnswer[]): TraceAnswer[] {
  return [...answers].sort((a, b) => a.attemptedIndex - b.attemptedIndex);
}

function isSkippedAnswer(answer: TraceAnswer): boolean {
  return answer.selectedOptions === undefined;
}

function classifyAnswer(
  answer: TraceAnswer,
  questionsById: Map<string, Question>,
): "correct" | "incorrect" | "skipped" {
  if (isSkippedAnswer(answer)) {
    return "skipped";
  }

  const question = questionsById.get(answer.questionId);
  if (!question) {
    return "incorrect";
  }

  return isAnswerCorrect(question, answer.selectedOptions!)
    ? "correct"
    : "incorrect";
}

function modeValue<T>(items: T[], serialize: (item: T) => string): T | undefined {
  if (items.length === 0) {
    return undefined;
  }

  const counts = new Map<string, { value: T; count: number }>();
  for (const item of items) {
    const key = serialize(item);
    const existing = counts.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      counts.set(key, { value: item, count: 1 });
    }
  }

  let best: { value: T; count: number } | undefined;
  for (const entry of counts.values()) {
    if (!best || entry.count > best.count) {
      best = entry;
    }
  }

  return best?.value;
}

function toSequenceStep(
  stepNumber: number,
  answer: TraceAnswer,
  questionsById: Map<string, Question>,
): SequenceStep {
  const question = questionsById.get(answer.questionId);
  const skipped = isSkippedAnswer(answer);
  const indices = answer.selectedOptions ?? [];

  return {
    stepNumber,
    attemptedIndex: answer.attemptedIndex,
    questionId: answer.questionId,
    questionText: questionText(questionsById, answer.questionId),
    selectedOptionIndices: indices,
    selectedOptionLabels: skipped
      ? "Skipped"
      : formatOptionLabels(question, indices),
    isSkipped: skipped,
  };
}

function traceToSequence(
  trace: TestTrace,
  questionsById: Map<string, Question>,
): SequenceStep[] {
  return sortByAttemptedIndex(trace.answers).map((answer, index) =>
    toSequenceStep(index + 1, answer, questionsById),
  );
}

function buildAverageSequence(
  traces: TestTrace[],
  questionsById: Map<string, Question>,
): SequenceStep[] {
  const answersByAttemptedIndex = new Map<number, TraceAnswer[]>();

  for (const trace of traces) {
    for (const answer of trace.answers) {
      const bucket = answersByAttemptedIndex.get(answer.attemptedIndex) ?? [];
      bucket.push(answer);
      answersByAttemptedIndex.set(answer.attemptedIndex, bucket);
    }
  }

  const indices = [...answersByAttemptedIndex.keys()].sort((a, b) => a - b);
  const steps: SequenceStep[] = [];

  for (const attemptedIndex of indices) {
    const bucket = answersByAttemptedIndex.get(attemptedIndex)!;
    const modeQuestionAnswer = modeValue(bucket, (a) => a.questionId);
    if (!modeQuestionAnswer) {
      continue;
    }

    const sameQuestion = bucket.filter(
      (a) => a.questionId === modeQuestionAnswer.questionId,
    );
    const representative = modeValue(sameQuestion, (a) =>
      JSON.stringify(a.selectedOptions ?? null),
    );

    if (!representative) {
      continue;
    }

    steps.push(
      toSequenceStep(steps.length + 1, representative, questionsById),
    );
  }

  return steps;
}

function countByQuestion(
  rows: { questionId: string; count: number }[],
  questionsById: Map<string, Question>,
): QuestionCountRow[] {
  return rows
    .map((row) => ({
      questionId: row.questionId,
      questionText: questionText(questionsById, row.questionId),
      count: row.count,
    }))
    .sort((a, b) => b.count - a.count);
}

export function aggregateSessionAnalytics(
  results: SessionResultRow[],
  questions: Question[],
): SessionAnalytics | null {
  if (results.length === 0) {
    return null;
  }

  const questionsById = new Map(questions.map((q) => [q.id, q]));
  const traces = results.map((row) => row.trace);

  const failedCounts = new Map<string, number>();
  const correctCounts = new Map<string, number>();
  const skippedCounts = new Map<string, number>();
  const perQuestion = new Map<
    string,
    { correct: number; incorrect: number; skipped: number }
  >();
  const wrongOptionCounts = new Map<
    string,
    Map<number, number>
  >();
  const questionAttemptTotals = new Map<string, number>();

  let scoreSum = 0;
  let timeSum = 0;

  for (const row of results) {
    scoreSum += scorePercentFromResult(row.result);
    timeSum += row.result.totalTime;

    for (const answer of row.trace.answers) {
      const outcome = classifyAnswer(answer, questionsById);
      const qid = answer.questionId;

      if (outcome === "incorrect") {
        failedCounts.set(qid, (failedCounts.get(qid) ?? 0) + 1);
      } else if (outcome === "correct") {
        correctCounts.set(qid, (correctCounts.get(qid) ?? 0) + 1);
      } else {
        skippedCounts.set(qid, (skippedCounts.get(qid) ?? 0) + 1);
      }

      const stats = perQuestion.get(qid) ?? {
        correct: 0,
        incorrect: 0,
        skipped: 0,
      };
      stats[outcome] += 1;
      perQuestion.set(qid, stats);

      if (!isSkippedAnswer(answer)) {
        questionAttemptTotals.set(
          qid,
          (questionAttemptTotals.get(qid) ?? 0) + 1,
        );
      }

      if (outcome === "incorrect" && answer.selectedOptions) {
        const optionMap =
          wrongOptionCounts.get(qid) ?? new Map<number, number>();
        for (const optionIndex of answer.selectedOptions) {
          optionMap.set(
            optionIndex,
            (optionMap.get(optionIndex) ?? 0) + 1,
          );
        }
        wrongOptionCounts.set(qid, optionMap);
      }
    }
  }

  const difficultyRows: DifficultyRow[] = [];
  for (const [questionId, stats] of perQuestion) {
    const attempts = stats.correct + stats.incorrect;
    if (attempts < MIN_ATTEMPTS_FOR_DIFFICULTY) {
      continue;
    }

    difficultyRows.push({
      questionId,
      questionText: questionText(questionsById, questionId),
      attempts,
      correct: stats.correct,
      incorrect: stats.incorrect,
      skipped: stats.skipped,
      correctRatePercent: Math.round((stats.correct * 100) / attempts),
    });
  }

  const top10Hardest = [...difficultyRows]
    .sort(
      (a, b) =>
        a.correctRatePercent - b.correctRatePercent ||
        b.attempts - a.attempts,
    )
    .slice(0, 10);

  const top10Easiest = [...difficultyRows]
    .sort(
      (a, b) =>
        b.correctRatePercent - a.correctRatePercent ||
        b.attempts - a.attempts,
    )
    .slice(0, 10);

  const popularWrongAnswers: PopularWrongRow[] = [];
  const popularQuestionIds = [...questionAttemptTotals.entries()]
    .filter(([, count]) => count >= POPULAR_QUESTION_MIN_ATTEMPTS)
    .sort((a, b) => b[1] - a[1])
    .map(([questionId]) => questionId);

  for (const questionId of popularQuestionIds) {
    const optionMap = wrongOptionCounts.get(questionId);
    if (!optionMap || optionMap.size === 0) {
      continue;
    }

    const question = questionsById.get(questionId);
    const totalAttempts = questionAttemptTotals.get(questionId) ?? 0;

    for (const [optionIndex, wrongPickCount] of optionMap) {
      popularWrongAnswers.push({
        questionId,
        questionText: questionText(questionsById, questionId),
        totalAttempts,
        optionIndex,
        optionText: formatOptionLabel(question, optionIndex),
        wrongPickCount,
      });
    }
  }

  popularWrongAnswers.sort(
    (a, b) =>
      b.wrongPickCount - a.wrongPickCount ||
      b.totalAttempts - a.totalAttempts,
  );

  const completedTraces = traces.filter((trace) => trace.endTime);
  const shortestPool =
    completedTraces.length > 0 ? completedTraces : traces;

  const longestTrace = traces.reduce((best, trace) =>
    trace.answers.length > best.answers.length ? trace : best,
  );
  const shortestTrace = shortestPool.reduce((best, trace) =>
    trace.answers.length < best.answers.length ? trace : best,
  );

  return {
    studentCount: results.length,
    averageScorePercent: Math.round(scoreSum / results.length),
    averageTimeMs: Math.round(timeSum / results.length),
    mostFailed: countByQuestion(
      [...failedCounts.entries()].map(([questionId, count]) => ({
        questionId,
        count,
      })),
      questionsById,
    ),
    mostCorrect: countByQuestion(
      [...correctCounts.entries()].map(([questionId, count]) => ({
        questionId,
        count,
      })),
      questionsById,
    ),
    mostSkipped: countByQuestion(
      [...skippedCounts.entries()].map(([questionId, count]) => ({
        questionId,
        count,
      })),
      questionsById,
    ),
    averageSequence: buildAverageSequence(traces, questionsById),
    longestSequence: traceToSequence(longestTrace, questionsById),
    shortestSequence: traceToSequence(shortestTrace, questionsById),
    top10Hardest,
    top10Easiest,
    popularWrongAnswers: popularWrongAnswers.slice(0, 20),
  };
}
