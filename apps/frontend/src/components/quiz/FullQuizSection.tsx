"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import CustomButton from "@/components/shared/CustomButton";
import Loader from "@/components/shared/Loader";
import QuizText from "@/components/shared/QuizText";
import {
  Badge,
  Card,
  CardContent,
  Label,
  Progress,
  RadioGroup,
  RadioGroupItem,
} from "@/components/shared/shadcn";
import useAPI from "@/hooks/api";
import client from "@/lib/api/client";
import type { QuizPayload, QuizResult, Track } from "@/lib/api/types";

const DIFFICULTY_BADGE: Record<string, { label: string; className: string }> = {
  easy: { label: "Easy", className: "bg-emerald-100 text-emerald-700" },
  medium: { label: "Medium", className: "bg-amber-100 text-amber-700" },
  hard: { label: "Hard", className: "bg-rose-100 text-rose-700" },
};

export function FullQuizSection({
  lessonId,
  track,
}: {
  lessonId: string;
  track: Track;
}) {
  const startedAtRef = useRef<number>(Date.now());
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    data: quiz,
    loading,
    error,
    callApi: fetchQuiz,
  } = useAPI<QuizPayload>({ url: `/quiz/full/${lessonId}`, lazy: true });

  useEffect(() => {
    fetchQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  const answeredCount = useMemo(
    () =>
      quiz ? quiz.questions.filter((q) => answers[q.id] != null).length : 0,
    [answers, quiz],
  );
  const allAnswered = quiz != null && answeredCount === quiz.questions.length;

  const handleSubmit = async () => {
    if (!quiz || !allAnswered || submitting) return;
    const timeSpentSec = Math.round((Date.now() - startedAtRef.current) / 1000);
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await client.post<QuizResult>(
        `/quiz/full/${lessonId}/submit`,
        {
          answers: quiz.questions.map((q) => ({
            questionId: q.id,
            answerIndex: answers[q.id],
          })),
          timeSpentSec,
        },
      );
      setResult(res.data);
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    } catch {
      setSubmitError("জমা দেওয়া যায়নি — আবার চেষ্টা করো।");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setResult(null);
    startedAtRef.current = Date.now();
    fetchQuiz();
  };

  if (loading && !quiz) {
    return (
      <div className="flex justify-center py-12">
        <Loader />
      </div>
    );
  }

  if (error) {
    const message =
      (error as { message?: string | string[] })?.message ?? "Quiz load হয়নি।";
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="py-6 text-center text-sm text-amber-800">
          {Array.isArray(message) ? message[0] : message}
        </CardContent>
      </Card>
    );
  }

  if (!quiz) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            📚 Full Review — সব {quiz.questions.length}টা প্রশ্ন
          </h2>
          <p className="text-xs text-slate-500">
            Pass: {quiz.passPercent}% • এই quiz-এ XP count হয় না — শুধু
            practice
          </p>
        </div>
        <span className="text-sm font-medium text-slate-500">
          {answeredCount}/{quiz.questions.length} উত্তর দেওয়া
        </span>
      </div>

      <Progress
        value={(answeredCount / quiz.questions.length) * 100}
        className="h-2"
      />

      {quiz.questions.map((question, qIndex) => {
        const resultItem = result?.results.find(
          (r) => r.questionId === question.id,
        );
        const badge = DIFFICULTY_BADGE[question.difficulty];
        return (
          <Card
            key={question.id}
            className={
              resultItem
                ? resultItem.correct
                  ? "border-emerald-300"
                  : "border-rose-300"
                : undefined
            }
          >
            <CardContent className="py-4">
              <div className="flex items-start justify-between gap-2">
                <div className="w-full font-medium text-slate-800">
                  {qIndex + 1}. <QuizText text={question.question} />
                </div>
                <Badge className={badge.className}>{badge.label}</Badge>
              </div>
              <RadioGroup
                className="mt-3 space-y-2"
                value={answers[question.id]?.toString() ?? ""}
                onValueChange={(value) =>
                  !result &&
                  setAnswers((prev) => ({
                    ...prev,
                    [question.id]: Number(value),
                  }))
                }
                disabled={result != null}
              >
                {question.options.map((option, optionIndex) => {
                  const isYourPick =
                    resultItem?.yourAnswerIndex === optionIndex;
                  const isCorrectOption =
                    resultItem?.correctIndex === optionIndex;
                  return (
                    <div
                      key={optionIndex}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${
                        isCorrectOption
                          ? "border-emerald-400 bg-emerald-50"
                          : isYourPick && !resultItem?.correct
                            ? "border-rose-400 bg-rose-50"
                            : "border-slate-200"
                      }`}
                    >
                      <RadioGroupItem
                        value={optionIndex.toString()}
                        id={`${question.id}-${optionIndex}`}
                      />
                      <Label
                        htmlFor={`${question.id}-${optionIndex}`}
                        className="w-full cursor-pointer font-normal"
                      >
                        <QuizText text={option} />
                        {isCorrectOption && result && " ✅"}
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
              {resultItem && (
                <div
                  className={`mt-3 rounded-lg p-3 text-sm ${
                    resultItem.correct
                      ? "bg-emerald-50 text-emerald-800"
                      : "bg-rose-50 text-rose-800"
                  }`}
                >
                  {resultItem.correct ? "✅ সঠিক! " : "❌ ভুল। "}
                  <QuizText text={resultItem.explanation} />
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {!result ? (
        <div className="flex flex-col items-end gap-2">
          {submitError && (
            <p className="text-sm text-rose-600">{submitError}</p>
          )}
          <CustomButton
            variant="primary"
            className="px-8 py-3 text-base"
            disabled={!allAnswered || submitting}
            onClick={handleSubmit}
          >
            {submitting ? "জমা হচ্ছে..." : "সব উত্তর জমা দাও ✋"}
          </CustomButton>
          {!allAnswered && (
            <p className="text-xs text-slate-400">
              সব {quiz.questions.length}টা প্রশ্নের উত্তর দিলে submit করা যাবে
            </p>
          )}
        </div>
      ) : (
        <Card
          className={
            result.passed
              ? "border-emerald-300 bg-emerald-50"
              : "border-rose-300 bg-rose-50"
          }
        >
          <CardContent className="py-6 text-center">
            <div className="text-4xl">{result.passed ? "🎉" : "😅"}</div>
            <p className="mt-2 text-2xl font-bold text-slate-800">
              {result.score}%{" "}
              <span className="text-base font-normal text-slate-500">
                ({result.correctCount}/{result.totalCount} সঠিক)
              </span>
            </p>
            {result.passed ? (
              <p className="mt-1 font-medium text-emerald-700">
                দারুণ! সব {result.totalCount}টার মধ্যে {result.correctCount}টা
                সঠিক।
              </p>
            ) : (
              <p className="mt-1 text-sm text-rose-700">
                আরেকটু practice করো — ভুলগুলোর explanation পড়ো, আবার চেষ্টা
                করো।
              </p>
            )}
            <div className="mt-4 flex justify-center gap-3">
              <CustomButton
                variant="primary"
                className="px-6 py-2.5"
                onClick={handleRetry}
              >
                🔄 আবার চেষ্টা করো
              </CustomButton>
              <Link
                href={`/quiz/${track}`}
                className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                ← Quiz List
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
