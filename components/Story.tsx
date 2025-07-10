// components/Story.tsx
import type { StoryType } from "@/constants/mock-data";
import { styles } from "@/styles/feed.styles";
import { Image, Text, TouchableOpacity, View } from "react-native";

export default function Story({ story }: { story: StoryType }) {
  // If avatar is a string, treat as a remote URI; else it's the local require(...) number
  const source =
    typeof story.avatar === "string" ? { uri: story.avatar } : story.avatar;

  return (
    <TouchableOpacity style={styles.storyWrapper}>
      <View style={[styles.storyRing, !story.hasStory && styles.noStory]}>
        <Image source={source} style={styles.storyAvatar} />
      </View>
      <Text style={styles.storyUsername}>{story.username}</Text>
    </TouchableOpacity>
  );
}
