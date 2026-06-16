"use client";

import { useEffect, useRef, useState } from "react";
import client from "@/lib/api/client";
import type { ChatHistory, ChatMessage } from "@/lib/api/types";

interface PendingImage {
  base64: string;
  mimeType: string;
  preview: string; // data URL for display
}

// Extends API ChatMessage with an optional image preview (current session only)
interface LocalMessage extends ChatMessage {
  imagePreview?: string;
}

function UserBubble({
  content,
  imagePreview,
}: {
  content: string;
  imagePreview?: string;
}) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[85%] space-y-1.5">
        {imagePreview && (
          <div className="flex justify-end">
            <img
              src={imagePreview}
              alt="shared"
              className="max-h-48 rounded-xl rounded-tr-sm object-contain border border-indigo-200 shadow-sm"
            />
          </div>
        )}
        {content && (
          <div className="rounded-2xl rounded-tr-sm bg-indigo-600 px-3.5 py-2.5 text-sm leading-relaxed text-white">
            {content}
          </div>
        )}
      </div>
    </div>
  );
}

function AiBubble({ content }: { content: string }) {
  return (
    <div className="flex justify-start gap-2">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm">
        🎓
      </div>
      <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-slate-100 px-3.5 py-2.5 text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">
        {content}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start gap-2">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm">
        🎓
      </div>
      <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-slate-100 px-3.5 py-3">
        <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:0ms]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:150ms]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:300ms]" />
      </div>
    </div>
  );
}

export function ChatDrawer({
  lessonId,
  lessonTitle,
  onClose,
}: {
  lessonId: string;
  lessonTitle: string;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [input, setInput] = useState("");
  const [pendingImage, setPendingImage] = useState<PendingImage | null>(null);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load history when mounted / lessonId changes
  useEffect(() => {
    setMessages([]);
    setPendingImage(null);
    client
      .get<ChatHistory>(`/chat/${lessonId}`)
      .then((r) => setMessages(r.data.messages))
      .catch(() => {});
  }, [lessonId]);

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Focus input on mount
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  function handlePaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const items = Array.from(e.clipboardData.items);
    const imageItem = items.find((item) => item.type.startsWith("image/"));
    if (!imageItem) return;

    e.preventDefault();
    const file = imageItem.getAsFile();
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      const base64 = dataUrl.split(",")[1];
      setPendingImage({ base64, mimeType: file.type, preview: dataUrl });
    };
    reader.readAsDataURL(file);
  }

  async function send() {
    const text = input.trim();
    const hasImage = !!pendingImage;
    if (!text && !hasImage) return;
    if (loading) return;

    const imageToSend = pendingImage;
    setInput("");
    setPendingImage(null);

    const displayContent = text;
    const userMsg: LocalMessage = {
      role: "user",
      content: displayContent,
      createdAt: new Date().toISOString(),
      imagePreview: imageToSend?.preview,
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const payload: {
        message: string;
        imageBase64?: string;
        imageMimeType?: string;
      } = { message: text || "" };

      if (imageToSend) {
        payload.imageBase64 = imageToSend.base64;
        payload.imageMimeType = imageToSend.mimeType;
      }

      const res = await client.post<{ reply: string }>(
        `/chat/${lessonId}`,
        payload,
      );
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: res.data.reply,
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "উত্তর দিতে সমস্যা হচ্ছে। একটু পরে আবার চেষ্টা করো।",
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="flex h-full w-105 flex-col border-l border-slate-200 bg-white">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-indigo-600 px-4 py-3">
        <div className="min-w-0">
          <p className="text-sm font-bold text-white">🎓 Tutor AI</p>
          <p className="truncate text-xs text-indigo-200">{lessonTitle}</p>
        </div>
        <button
          onClick={onClose}
          className="ml-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white hover:bg-indigo-500"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 && !loading && (
          <div className="mt-8 text-center">
            <p className="text-3xl">🎓</p>
            <p className="mt-2 text-sm font-medium text-slate-700">
              আমি তোমার tutor!
            </p>
            <p className="mt-1 text-xs text-slate-400">
              প্রশ্ন লেখো বা screenshot paste করো।
            </p>
          </div>
        )}
        {messages.map((msg, i) =>
          msg.role === "user" ? (
            <UserBubble
              key={i}
              content={msg.content}
              imagePreview={msg.imagePreview}
            />
          ) : (
            <AiBubble key={i} content={msg.content} />
          ),
        )}
        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="shrink-0 border-t border-slate-200 bg-white px-4 py-3">
        {/* Image preview */}
        {pendingImage && (
          <div className="relative mb-2 inline-block">
            <img
              src={pendingImage.preview}
              alt="pending"
              className="max-h-24 rounded-lg border border-slate-200 object-contain shadow-sm"
            />
            <button
              onClick={() => setPendingImage(null)}
              className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-slate-700 text-[10px] text-white hover:bg-red-600"
            >
              ✕
            </button>
          </div>
        )}

        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={
              pendingImage
                ? "প্রশ্ন লেখো (optional)…"
                : "প্রশ্ন লেখো বা screenshot paste করো…"
            }
            rows={1}
            className="flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:bg-white"
            style={{ maxHeight: 120, overflowY: "auto" }}
          />
          <button
            onClick={send}
            disabled={(!input.trim() && !pendingImage) || loading}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white transition hover:bg-indigo-700 disabled:opacity-40"
          >
            ↑
          </button>
        </div>
        <p className="mt-1.5 text-center text-[10px] text-slate-400">
          Ctrl+V = image paste · Shift+Enter = নতুন line
        </p>
      </div>
    </div>
  );
}
