"use client";

import { useEffect } from "react";
import { useChatContext } from "@/contexts/ChatContext";

export function LessonChatRegistrar({
  lessonId,
  lessonTitle,
}: {
  lessonId: string;
  lessonTitle: string;
}) {
  const { setLesson, clearLesson } = useChatContext();

  useEffect(() => {
    setLesson(lessonId, lessonTitle);
    return () => clearLesson();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId, lessonTitle]);

  return null;
}
