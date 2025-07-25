// chat.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const table = "chats";

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert(table, {
      title: args.title,
      description: args.description,
    });
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx, args) => {
    return await ctx.db.query(table).order("desc").take(10);
  },
});

export const getRecent = query({
  args: {},
  handler: async (ctx, args) => {
    return await ctx.db.query(table).order("desc").take(10);
  },
});
