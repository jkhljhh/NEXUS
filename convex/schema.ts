import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const resultSchema = v.union(
  v.object({ error: v.string() }),
  v.object({ title: v.string(), subtitle: v.string(), data: v.any() }),
);

export default defineSchema({
  reports: defineTable({
    name: v.string(),
  }),

  chats: defineTable({
    title: v.string(),
    description: v.string(),
  }),

  messages: defineTable({
    chatId: v.id("chats"),
    message: v.optional(v.string()),
    table: v.optional(resultSchema),
    graph: v.optional(resultSchema),
  }),
});
