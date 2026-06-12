import { LessonScreen } from "@/components/lesson/LessonScreen";

export default function LessonPage({
  params,
}: {
  params: { lessonId: string };
}) {
  return <LessonScreen lessonId={params.lessonId} />;
}
