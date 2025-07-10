// convex/user.ts
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { mutation, MutationCtx, query, QueryCtx } from "./_generated/server";

export const createUser = mutation({
  args: {
    username: v.string(),
    fullname: v.string(),
    image: v.string(),
    bio: v.optional(v.string()),
    email: v.string(),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
    if (existingUser) return;
    await ctx.db.insert("users", {
      username: args.username,
      fullname: args.fullname,
      email: args.email,
      bio: args.bio,
      image: args.image,
      clerkId: args.clerkId,
      followers: 0,
      following: 0,
      posts: 0,
    });
  },
});

export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();
  },
});

export const updateProfile = mutation({
  args: {
    fullname: v.string(),
    bio: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const me = await getAuthenticatedUser(ctx);
    await ctx.db.patch(me._id, {
      fullname: args.fullname,
      bio: args.bio,
    });
  },
});

export async function getAuthenticatedUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthorized");
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .first();
  if (!user) throw new Error("User not found");
  return user;
}

export const getUserProfile = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.id);
    if (!user) throw new Error("User not found");
    return user;
  },
});

export const isFollowing = query({
  args: { followingId: v.id("users") },
  handler: async (ctx, args) => {
    const me = await getAuthenticatedUser(ctx);
    const follow = await ctx.db
      .query("follows")
      .withIndex("by_both", (q) =>
        q.eq("followerId", me._id).eq("followingId", args.followingId)
      )
      .first();
    return !!follow;
  },
});

export const toggleFollow = mutation({
  args: { followingId: v.id("users") },
  handler: async (ctx, args) => {
    const me = await getAuthenticatedUser(ctx);
    const existing = await ctx.db
      .query("follows")
      .withIndex("by_both", (q) =>
        q.eq("followerId", me._id).eq("followingId", args.followingId)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      await updateFollowCounts(ctx, me._id, args.followingId, false);
    } else {
      await ctx.db.insert("follows", {
        followerId: me._id,
        followingId: args.followingId,
      });
      await updateFollowCounts(ctx, me._id, args.followingId, true);
      await ctx.db.insert("notifications", {
        receiverId: args.followingId,
        senderId: me._id,
        type: "follow",
      });
    }
  },
});

async function updateFollowCounts(
  ctx: MutationCtx,
  followerId: Id<"users">,
  followingId: Id<"users">,
  isFollow: boolean
) {
  const follower = await ctx.db.get(followerId);
  const following = await ctx.db.get(followingId);
  if (follower && following) {
    await ctx.db.patch(followerId, {
      following: follower.following + (isFollow ? 1 : -1),
    });
    await ctx.db.patch(followingId, {
      followers: following.followers + (isFollow ? 1 : -1),
    });
  }
}

export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    return (
      (await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", email))
        .first()) ?? null
    );
  },
});

// — New: fetch the list of users who follow a given user
export const getFollowers = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const recs = await ctx.db
      .query("follows")
      .withIndex("by_following", (q) => q.eq("followingId", userId))
      .collect();
    const users = await Promise.all(
      recs.map((r) => ctx.db.get(r.followerId))
    );
    return users.filter((u): u is NonNullable<typeof u> => u !== null);
  },
});

// — New: fetch the list of users that a given user is following
export const getFollowing = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const recs = await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("followerId", userId))
      .collect();
    const users = await Promise.all(
      recs.map((r) => ctx.db.get(r.followingId))
    );
    return users.filter((u): u is NonNullable<typeof u> => u !== null);
  },
});
