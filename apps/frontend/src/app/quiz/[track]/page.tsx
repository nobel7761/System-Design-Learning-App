import { QuizTrackScreen } from "@/components/quiz/QuizTrackScreen";
import type { Track } from "@/lib/api/types";

export default function QuizTrackPage({
  params,
}: {
  params: { track: string };
}) {
  return <QuizTrackScreen track={params.track as Track} />;
}
