"use client";

import { useState, useMemo, useEffect } from "react";
import Fuse from "fuse.js";
import { cn } from "@/lib/utils";
import { SUGGESTIONS } from "./suggestions";

const fuse = new Fuse(SUGGESTIONS, {
  threshold: 0.3,
  ignoreLocation: true,
  useExtendedSearch: true,
});

export function AutoComplete({
  value,
  onSelect,
  className,
}: {
  value: string;
  onSelect: (newValue: string) => void;
  className?: string;
}) {
  const [activeIndex, setActiveIndex] = useState(-1);
  const lastWord = value.split(/\s+/).pop() ?? "";
  const endsWithSpace = value.endsWith(" ");

  const matches = useMemo(() => {
    if (endsWithSpace || !lastWord || lastWord.length < 2) return [];

    return fuse
      .search(`^${lastWord}`)
      .map((r) => r.item)
      .filter((s) => s.toLowerCase() !== lastWord.toLowerCase())
      .slice(0, 5);
  }, [lastWord, endsWithSpace]);

  useEffect(() => {
    if (matches.length > 0) {
      setActiveIndex(0);
    } else {
      setActiveIndex(-1);
    }
  }, [matches]);

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (!matches.length) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % matches.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + matches.length) % matches.length);
      } else if ((e.key === "Enter" || e.key === "Tab") && activeIndex !== -1) {
        e.preventDefault();
        applySuggestion(matches[activeIndex]);
      }
    };

    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [matches, activeIndex]);

  const applySuggestion = (selected: string) => {
    const words = value.trim().split(/\s+/);
    words[words.length - 1] = selected;
    onSelect(words.join(" ") + " ");
    setActiveIndex(-1);
  };

  if (!matches.length) return null;

  return (
    <div
      className={cn(
        "absolute bottom-full mb-1 left-2.5 right-2.5 bg-popover shadow-md rounded-md border max-h-48 overflow-y-auto z-50",
        className,
      )}
    >
      {matches.map((item, i) => (
        <div
          key={i}
          onMouseDown={(e) => {
            e.preventDefault();
            applySuggestion(item);
          }}
          className={cn(
            "px-3 py-2 text-sm cursor-pointer hover:bg-muted",
            i === activeIndex && "bg-muted",
          )}
        >
          {item}
        </div>
      ))}
    </div>
  );
}
