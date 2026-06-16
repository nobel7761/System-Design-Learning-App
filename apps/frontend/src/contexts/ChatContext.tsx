"use client";

import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

interface ChatContextValue {
  lessonId: string | null;
  lessonTitle: string;
  isOpen: boolean;
  setLesson: (id: string, title: string) => void;
  clearLesson: () => void;
  toggle: () => void;
  close: () => void;
}

const ChatContext = createContext<ChatContextValue>({
  lessonId: null,
  lessonTitle: "",
  isOpen: false,
  setLesson: () => {},
  clearLesson: () => {},
  toggle: () => {},
  close: () => {},
});

export function ChatProvider({ children }: { children: ReactNode }) {
  const [lessonId, setLessonId] = useState<string | null>(null);
  const [lessonTitle, setLessonTitle] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  return (
    <ChatContext.Provider
      value={{
        lessonId,
        lessonTitle,
        isOpen,
        setLesson: (id, title) => {
          setLessonId(id);
          setLessonTitle(title);
        },
        clearLesson: () => {
          setLessonId(null);
          setLessonTitle("");
          setIsOpen(false);
        },
        toggle: () => setIsOpen((prev) => !prev),
        close: () => setIsOpen(false),
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export const useChatContext = () => useContext(ChatContext);
