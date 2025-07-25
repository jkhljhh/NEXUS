// Filename: page.tsx
// Path: @/app/(dashboard)/chat
"use client";
import { useState } from "react";
import { sendMessageAction } from "@/actions/sendMessage";
import { UserMessage, AssistantMessage } from "@/components/message";
import { ChatHeader, ChatTabs, ChatTabsList } from "@/components/chat-content";
import { ChatInput } from "@/components/chat-input/input";
import { DataTable } from "@/components/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { DataGraph } from "@/components/data-graph";
import { DataMarkdown } from "@/components/data-markdown";

type Message = { role: "user" | "assistant"; text: string | object };

export default function Page() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() || loading) return;

    setMessages((msgs) => [...msgs, { role: "user", text: value }]);

    setLoading(true);

    const response = await sendMessageAction(value);

    if (response.error) {
      //
    }

    setMessages((msgs) => [...msgs, { role: "assistant", text: response }]);

    setValue("");

    console.log(messages);
    setLoading(false);
  };

  return (
    <>
      <div className="overflow-y-scroll flex-1 w-full pt-4">
        <div className="flex-1 w-full mx-auto max-w-4xl">
          <ChatTabs>
            <ChatTabsList />
            {messages.map((msg, i) =>
              msg.role === "user" ? (
                <UserMessage key={i}>{msg.text}</UserMessage>
              ) : (
                <AssistantMessage key={i} className="flex flex-col gap-4">
                  {loading && (
                    <div className="space-y-2">
                      {["60%", "70%", "40%", "90%", "75%"].map((width, i) => (
                        <Skeleton key={i} className="h-6" style={{ width }} />
                      ))}
                    </div>
                  )}
                  <ChatHeader
                    title={msg.text.data.table.title}
                    description={msg.text.data.table.subtitle}
                  />
                  <DataTable data={msg.text.data.table.data} />
                  <hr />
                  {/* <ChatHeader title={msg.text.graphs.title} /> */}
                  <DataGraph data={msg.text.graphs} />
                  <hr />
                  <ChatHeader title={msg.text.markdown.title} />
                  <DataMarkdown data={msg.text.markdown.data} />
                </AssistantMessage>
              ),
            )}
          </ChatTabs>
        </div>

        <div className="shrink-0 min-w-[24px] min-h-[24px]" />
      </div>

      <div className="w-full mx-auto max-w-4xl px-4 pb-4 bg-background">
        <ChatInput
          onSubmit={handleSubmit}
          loading={loading}
          value={value}
          setValue={setValue}
        />
      </div>
    </>
  );
}
