// message.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { resultSchema } from "./schema";

const table = "messages";

export const create = mutation({
  args: {
    chatId: v.id("chats"),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert(table, {
      chatId: args.chatId,
      message: args.message,
    });
  },
});

export const patchTable = mutation({
  args: {
    id: v.id("messages"),
    table: v.optional(resultSchema),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      table: args.table,
    });
  },
});

export const patchGraph = mutation({
  args: {
    id: v.id("messages"),
    graph: v.optional(resultSchema),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      graph: args.graph,
    });
  },
});

export const getAllByChatId = query({
  args: { id: v.id("chats") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query(table)
      .filter((q) => q.eq(q.field("chatId"), args.id))
      .order("asc")
      .collect();
  },
});
