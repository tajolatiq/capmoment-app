// app/ownfeed/[index].tsx

import { Loader } from "@/components/Loader";
import Post from "@/components/Post";
import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { styles } from "@/styles/ownfeed.styles";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function OwnFeedPost() {
  const router = useRouter();
  const { index } = useLocalSearchParams<{ index: string }>();

  // Fetch the full, enriched feed
  const feed = useQuery(api.post.getFeedPosts);

  // Wait for data
  if (feed === undefined) return <Loader />;

  // Find the tapped post by its _id
  const post = feed.find((p) => p._id === index);

  // If we can’t find it, show “not found”
  if (!post) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
        <View style={styles.centered}>
          <Ionicons name="images-outline" size={48} color={COLORS.grey} />
          <Text style={{ color: COLORS.white, marginTop: 12 }}>
            Post not found
          </Text>
        </View>
      </View>
    );
  }

  // Otherwise render that single post
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Post post={post} />
      </ScrollView>
    </View>
  );
}
