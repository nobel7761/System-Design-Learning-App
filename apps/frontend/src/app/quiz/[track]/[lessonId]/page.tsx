import { FullQuizScreen } from "@/components/quiz/FullQuizScreen";
import type { Track } from "@/lib/api/types";

export default function FullQuizPage({
  params,
}: {
  params: { track: string; lessonId: string };
}) {
  return (
    <FullQuizScreen lessonId={params.lessonId} track={params.track as Track} />
  );
}
