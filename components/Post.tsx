// components/Post.tsx
import { Loader } from "@/components/Loader";
import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel"; // ← ensure you import Id
import { styles } from "@/styles/feed.styles";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { formatDistanceToNow } from "date-fns";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CommentsModal from "./CommentsModal";


type PostProps = {
  post: {
    _id: Id<"posts">;          // ← use Id<"posts"> here
    imageUrl: string;
    caption?: string;
    likes: number;
    comments: number;
    _creationTime: number;
    isLiked: boolean;
    isBookmarked: boolean;
    author: {
      _id: string;
      username: string;
      image: string;
    };
  };
};

export default function Post({ post }: PostProps) {
  const router = useRouter();
  const { user } = useUser();
  const currentUser = useQuery(
    api.user.getUserByClerkId,
    user ? { clerkId: user.id } : "skip"
  );

  const toggleLike = useMutation(api.post.toggleLike);
  const toggleBookmark = useMutation(api.bookmarks.toggleBookmark);
  const deletePost = useMutation(api.post.deletePost);

  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked);
  const [showComments, setShowComments] = useState(false);

  // ─── Likers Modal ─────────────────────────────────────────────
  const [showLikers, setShowLikers] = useState(false);
  const likers = useQuery(api.post.getLikers, { postId: post._id });

  const handleLike = async () => {
    const newVal = await toggleLike({ postId: post._id });
    setIsLiked(newVal);
  };
  const handleBookmark = async () => {
    const newVal = await toggleBookmark({ postId: post._id });
    setIsBookmarked(newVal);
  };
  const handleDelete = async () => {
    await deletePost({ postId: post._id });
  };

  return (
    <View style={styles.post}>
      {/* HEADER */}
      <View style={styles.postHeader}>
        <TouchableOpacity
          onPress={() =>
            router.push(
              currentUser && currentUser._id === post.author._id
                ? "/(tabs)/profile"
                : `/user/${post.author._id}`
            )
          }
          style={styles.postHeaderLeft}
        >
          <Image
            source={post.author.image}
            style={styles.postAvatar}
            contentFit="cover"
            transition={200}
          />
          <Text style={styles.postUsername}>{post.author.username}</Text>
        </TouchableOpacity>
        {post.author._id === currentUser?._id ? (
          <TouchableOpacity onPress={handleDelete}>
            <Ionicons name="trash-outline" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        ) : (
          <Ionicons name="ellipsis-horizontal" size={20} color={COLORS.white} />
        )}
      </View>

      {/* IMAGE */}
      <Image source={post.imageUrl} style={styles.postImage} contentFit="cover" />

      {/* ACTIONS */}
      <View style={styles.postActions}>
        <View style={styles.postActionsLeft}>
          <TouchableOpacity onPress={handleLike}>
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={24}
              color={isLiked ? COLORS.primary : COLORS.white}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowComments(true)}>
            <Ionicons name="chatbubble-outline" size={22} color={COLORS.white} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={handleBookmark}>
          <Ionicons
            name={isBookmarked ? "bookmark" : "bookmark-outline"}
            size={22}
            color={COLORS.white}
          />
        </TouchableOpacity>
      </View>

      {/* POST INFO */}
      <View style={styles.postInfo}>
        {/* tappable likes text */}
        <TouchableOpacity onPress={() => setShowLikers(true)}>
          <Text style={styles.likesText}>
            {post.likes > 0
              ? `${post.likes.toLocaleString()} likes`
              : "Be the first to like"}
          </Text>
        </TouchableOpacity>

        {post.caption && (
          <View style={styles.captionContainer}>
            <Text style={styles.captionUsername}>{post.author.username}</Text>
            <Text style={styles.captionText}>{post.caption}</Text>
          </View>
        )}

        {post.comments > 0 && (
          <TouchableOpacity onPress={() => setShowComments(true)}>
            <Text style={styles.commentsText}>
              View all {post.comments} comments
            </Text>
          </TouchableOpacity>
        )}

        <Text style={styles.timeAgo}>
          {formatDistanceToNow(post._creationTime, { addSuffix: true })}
        </Text>
      </View>

      {/* Comments Modal */}
      <CommentsModal
        postId={post._id}             // ← still passes Id<"posts">
        visible={showComments}
        onClose={() => setShowComments(false)}
      />

      {/* Likers Modal */}
      <Modal
        visible={showLikers}
        animationType="slide"
        onRequestClose={() => setShowLikers(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowLikers(false)}>
              <Ionicons name="close" size={24} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Liked by</Text>
            <View style={{ width: 24 }} />
          </View>

          {likers === undefined ? (
            <Loader />
          ) : (
            <FlatList
              data={likers}
              keyExtractor={(u) => u._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.listItem}
                  onPress={() => {
                    setShowLikers(false);
                    if (currentUser && item._id === currentUser._id) {
                      router.push("/(tabs)/profile");
                    } else {
                      router.push(`/user/${item._id}`);
                    }
                  }}
                >
                  <Image
                    source={item.image}
                    style={styles.listAvatar}
                    contentFit="cover"
                  />
                  <Text style={styles.listUsername}>{item.username}</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </Modal>
    </View>
  );
}
