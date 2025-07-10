// app/user/[id].tsx

import { Loader } from "@/components/Loader";
import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { styles } from "@/styles/profile.styles";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  FlatList,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { userId: myClerkId } = useAuth();

  // 1) Profile we’re viewing
  const profile = useQuery(api.user.getUserProfile, {
    id: id as Id<"users">,
  });

  // 2) Their posts
  const posts = useQuery(api.post.getPostsByUser, {
    userId: id as Id<"users">,
  });

  // 3) Follow state
  const isFollowing = useQuery(api.user.isFollowing, {
    followingId: id as Id<"users">,
  });

  // 4) Followers & following lists
  const followers = useQuery(api.user.getFollowers, {
    userId: id as Id<"users">,
  });
  const following = useQuery(api.user.getFollowing, {
    userId: id as Id<"users">,
  });

  // 5) My own Convex record so I know my _id
  const myRecord = useQuery(
    api.user.getUserByClerkId,
    myClerkId ? { clerkId: myClerkId } : "skip"
  );

  const toggleFollow = useMutation(api.user.toggleFollow);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)");
  };

  // wait for data
  if (
    !profile ||
    posts === undefined ||
    isFollowing === undefined ||
    followers === undefined ||
    following === undefined
  ) {
    return <Loader />;
  }

  // sort newest first
  const sortedPosts = [...posts].sort(
    (a, b) => b._creationTime - a._creationTime
  );

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{profile.username}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* PROFILE INFO */}
        <View style={styles.profileInfo}>
          <View style={styles.avatarAndStats}>
            <Image
              source={profile.image}
              style={styles.avatar}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{profile.posts}</Text>
                <Text style={styles.statLabel}>Posts</Text>
              </View>
              <TouchableOpacity
                style={styles.statItem}
                onPress={() => setShowFollowers(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.statNumber}>{profile.followers}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.statItem}
                onPress={() => setShowFollowing(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.statNumber}>{profile.following}</Text>
                <Text style={styles.statLabel}>Following</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.name}>{profile.fullname}</Text>
          {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}

          <TouchableOpacity
            style={[
              styles.followButton,
              isFollowing && styles.followingButton,
            ]}
            onPress={() =>
              toggleFollow({ followingId: id as Id<"users"> })
            }
          >
            <Text
              style={[
                styles.followButtonText,
                isFollowing && styles.followingButtonText,
              ]}
            >
              {isFollowing ? "Following" : "Follow"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* POSTS GRID */}
        <View style={styles.postsGrid}>
          {sortedPosts.length === 0 ? (
            <View style={styles.noPostsContainer}>
              <Ionicons
                name="images-outline"
                size={48}
                color={COLORS.grey}
              />
              <Text style={styles.noPostsText}>No posts yet</Text>
            </View>
          ) : (
            <FlatList
              data={sortedPosts}
              numColumns={3}
              scrollEnabled={false}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.gridItem}
                  onPress={() =>
                    router.push({
                      pathname: "/ownfeed/[index]",
                      params: { index: item._id },
                    })
                  }
                >
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.gridImage}
                    contentFit="cover"
                    transition={200}
                    cachePolicy="memory-disk"
                  />
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </ScrollView>

      {/* FOLLOWERS MODAL */}
      <Modal
        visible={showFollowers}
        animationType="slide"
        onRequestClose={() => setShowFollowers(false)}
      >
        <View style={{ flex: 1, backgroundColor: COLORS.background }}>
          <View style={styles.listHeader}>
            <TouchableOpacity
              onPress={() => setShowFollowers(false)}
              style={styles.headerIcon}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.listTitle}>Followers</Text>
          </View>
          <FlatList
            data={followers}
            keyExtractor={(u) => u._id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.listItem}
                onPress={() => {
                  setShowFollowers(false);
                  if (myRecord && item._id === myRecord._id) {
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
        </View>
      </Modal>

      {/* FOLLOWING MODAL */}
      <Modal
        visible={showFollowing}
        animationType="slide"
        onRequestClose={() => setShowFollowing(false)}
      >
        <View style={{ flex: 1, backgroundColor: COLORS.background }}>
          <View style={styles.listHeader}>
            <TouchableOpacity
              onPress={() => setShowFollowing(false)}
              style={styles.headerIcon}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.listTitle}>Following</Text>
          </View>
          <FlatList
            data={following}
            keyExtractor={(u) => u._id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.listItem}
                onPress={() => {
                  setShowFollowing(false);
                  if (myRecord && item._id === myRecord._id) {
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
        </View>
      </Modal>
    </View>
  );
}
