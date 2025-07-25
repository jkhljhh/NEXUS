// project.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const table = "reports";

export const create = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.insert(table, { name: args.name });
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query(table).collect();
  },
});
