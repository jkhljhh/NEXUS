"use client";

import { redirect } from "next/navigation";
import { useState } from "react";
import { useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ChatInput } from "@/components/chat-input/input";
import { getGraphData, getTableData } from "./api";

export function CreateChatForm() {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);

  const createChat = useMutation(api.chat.create);
  const createMessage = useMutation(api.message.create);
  const patchTableMessage = useMutation(api.message.patchTable);
  const patchGraphMessage = useMutation(api.message.patchGraph);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() || loading) return;

    const query = value;
    setLoading(true);
    setValue("");

    // Create new chat chat
    const chatId = await createChat({
      title: query,
      description: "chat desc placeholder",
    });

    const messageId = await createMessage({
      chatId: chatId,
      message: query,
    });

    try {
      const tableData = await getTableData(query);
      await patchTableMessage({
        id: messageId,
        table: tableData,
      });
    } catch (err) {
      // TODO: Handle error
      await patchTableMessage({
        id: messageId,
        table: { error: "Failed to generate table" },
      });
      console.error("Table generation failed", err);
    }

    void (async () => {
      try {
        const graphData = await getGraphData();
        await patchGraphMessage({
          id: messageId,
          graph: graphData,
        });
      } catch (err) {
        // TODO: Handle error
        await patchGraphMessage({
          id: messageId,
          graph: { error: "Failed to generate graph" },
        });
        console.error("Graph generation failed", err);
      }
    })();

    setLoading(false);
    redirect(`/c/${chatId}`);
  };

  return (
    <ChatInput
      onSubmit={handleSubmit}
      loading={loading}
      value={value}
      setValue={setValue}
    />
  );
}
