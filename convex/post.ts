// convex/post.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthenticatedUser } from "./user";

export const generateUploadUrl = mutation(async (ctx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthorized");
  return await ctx.storage.generateUploadUrl();
});

export const createPost = mutation({
  args: {
    caption: v.optional(v.string()),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);
    const imageUrl = await ctx.storage.getUrl(args.storageId);
    if (!imageUrl) throw new Error("Image not found");

    const postId = await ctx.db.insert("posts", {
      userId: currentUser._id,
      imageUrl,
      storageId: args.storageId,
      caption: args.caption,
      likes: 0,
      comments: 0,
    });
    await ctx.db.patch(currentUser._id, {
      posts: (currentUser.posts || 0) + 1,
    });
    return postId;
  },
});

export const getFeedPosts = query({
  handler: async (ctx) => {
    const currentUser = await getAuthenticatedUser(ctx);
    const posts = await ctx.db.query("posts").order("desc").collect();
    const postsWithInfo = await Promise.all(
      posts.map(async (post) => {
        const postAuthor = await ctx.db.get(post.userId);
        const like = await ctx.db
          .query("likes")
          .withIndex("by_user_and_post", (q) =>
            q.eq("userId", currentUser._id).eq("postId", post._id)
          )
          .first();
        const bookmark = await ctx.db
          .query("bookmarks")
          .withIndex("by_user_and_post", (q) =>
            q.eq("userId", currentUser._id).eq("postId", post._id)
          )
          .first();
        return {
          ...post,
          author: {
            _id: postAuthor!._id,
            username: postAuthor!.username,
            image: postAuthor!.image,
          },
          isLiked: !!like,
          isBookmarked: !!bookmark,
        };
      })
    );
    return postsWithInfo;
  },
});

export const toggleLike = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, { postId }) => {
    const currentUser = await getAuthenticatedUser(ctx);
    const existing = await ctx.db
      .query("likes")
      .withIndex("by_user_and_post", (q) =>
        q.eq("userId", currentUser._id).eq("postId", postId)
      )
      .first();
    const post = await ctx.db.get(postId);
    if (!post) throw new Error("Post not found");

    if (existing) {
      await ctx.db.delete(existing._id);
      await ctx.db.patch(postId, { likes: post.likes - 1 });
      return false;
    } else {
      await ctx.db.insert("likes", {
        userId: currentUser._id,
        postId,
      });
      await ctx.db.patch(postId, { likes: post.likes + 1 });
      if (currentUser._id !== post.userId) {
        await ctx.db.insert("notifications", {
          receiverId: post.userId,
          senderId: currentUser._id,
          type: "like",
          postId,
        });
      }
      return true;
    }
  },
});

export const deletePost = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, { postId }) => {
    const currentUser = await getAuthenticatedUser(ctx);
    const post = await ctx.db.get(postId);
    if (!post) throw new Error("Post not found");
    if (post.userId !== currentUser._id) throw new Error("Not authorized");

    // delete likes, comments, bookmarks, notifications, storage, post record...
    const likes = await ctx.db
      .query("likes")
      .withIndex("by_post", (q) => q.eq("postId", postId))
      .collect();
    for (const l of likes) await ctx.db.delete(l._id);

    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", postId))
      .collect();
    for (const c of comments) await ctx.db.delete(c._id);

    const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_post", (q) => q.eq("postId", postId))
      .collect();
    for (const b of bookmarks) await ctx.db.delete(b._id);

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_post", (q) => q.eq("postId", postId))
      .collect();
    for (const n of notifications) await ctx.db.delete(n._id);

    await ctx.storage.delete(post.storageId);
    await ctx.db.delete(postId);
    await ctx.db.patch(currentUser._id, {
      posts: Math.max(0, (currentUser.posts || 1) - 1),
    });
  },
});

export const getPostsByUser = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, { userId }) => {
    const user = userId
      ? await ctx.db.get(userId)
      : await getAuthenticatedUser(ctx);
    if (!user) throw new Error("User not found");
    return await ctx.db
      .query("posts")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
  },
});

// ─── NEW: List of users who liked a post ────────────────────────────────
export const getLikers = query({
  args: { postId: v.id("posts") },
  handler: async (ctx, { postId }) => {
    const likes = await ctx.db
      .query("likes")
      .withIndex("by_post", (q) => q.eq("postId", postId))
      .collect();
    const users = await Promise.all(
      likes.map(async (l) => {
        const u = await ctx.db.get(l.userId);
        if (!u) throw new Error("User not found");
        return { _id: u._id, username: u.username, image: u.image };
      })
    );
    return users;
  },
});
