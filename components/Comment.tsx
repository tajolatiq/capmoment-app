// components/Comment.tsx

import { styles } from "@/styles/feed.styles";
import { formatDistanceToNow } from "date-fns";
import { Link } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface CommentProps {
  comment: {
    _id: string;
    content: string;
    _creationTime: number;
    userId: string;            // this exists on your comment records
    user: {
      fullname: string;
      image: string;
    };
  };
}

export default function Comment({ comment }: CommentProps) {
  return (
    <View style={styles.commentContainer}>
      {/* Avatar → user’s page */}
      <Link
        href={{ pathname: "/user/[id]", params: { id: comment.userId } }}
        asChild
      >
        <TouchableOpacity>
          <Image
            source={{ uri: comment.user.image }}
            style={styles.commentAvatar}
          />
        </TouchableOpacity>
      </Link>

      <View style={styles.commentContent}>
        {/* Username → user’s page */}
        <Link
          href={{ pathname: "/user/[id]", params: { id: comment.userId } }}
          asChild
        >
          <TouchableOpacity>
            <Text style={styles.commentUsername}>
              {comment.user.fullname}
            </Text>
          </TouchableOpacity>
        </Link>

        <Text style={styles.commentText}>{comment.content}</Text>
        <Text style={styles.commentTime}>
          {formatDistanceToNow(comment._creationTime, { addSuffix: true })}
        </Text>
      </View>
    </View>
  );
}
