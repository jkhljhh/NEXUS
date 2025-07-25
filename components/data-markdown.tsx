"use client";

import React from "react";
import ReactMarkdown from "react-markdown";

export function DataMarkdown({ data }: { data: string }) {
  return (
    <div className="prose prose-headings:font-medium prose-h2:text-lg max-w-none dark:prose-invert">
      <ReactMarkdown>{data}</ReactMarkdown>
    </div>
  );
}
