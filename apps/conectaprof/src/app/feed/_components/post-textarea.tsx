import type { ChangeEvent } from "react";
import React, { useEffect, useRef, useState } from "react";

export interface HashtagTextareaProps {
  text: string;
  setText: (text: string) => void;
}

export function HashtagTextarea({ text, setText }: HashtagTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const highlightHashtags = (text: string): string => {
    const parts = text.split(" ");
    return parts
      .map((part, index) => {
        if (part.startsWith("#")) {
          return `<span key=${index} class="text-blue-500">${part}</span>`;
        }
        return part;
      })
      .join(" ");
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: we need to listen for the text change to update the height
  useEffect(() => {
    const textarea = textareaRef.current;
    const highlight = highlightRef.current;
    if (highlight && textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${highlight.scrollHeight}px`;
    }
  }, [text]);

  return (
    <div className="relative w-full">
      <div
        ref={highlightRef}
        className="pointer-events-none absolute left-0 top-0 z-10 w-full whitespace-pre-wrap break-words p-2"
        dangerouslySetInnerHTML={{ __html: highlightHashtags(text) }}
      />
      <textarea
        ref={textareaRef}
        value={text}
        onChange={handleChange}
        className="relative z-20 min-h-[3rem] w-full resize-none overflow-hidden rounded-md border border-gray-300 bg-transparent p-2 caret-black"
        placeholder="Digite algo com #hashtags"
        style={{ color: "transparent", height: "auto" }}
      />
      <div className="hidden">{text}</div>
    </div>
  );
}
