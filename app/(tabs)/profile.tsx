// app/(tabs)/profile.tsx

import { Loader } from "@/components/Loader";
import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { styles } from "@/styles/profile.styles";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

export default function Profile() {
  const { signOut, userId } = useAuth();
  const router = useRouter();

  // 1) Current user
  const currentUser = useQuery(
    api.user.getUserByClerkId,
    userId ? { clerkId: userId } : "skip"
  );

  // 2) Their posts
  const posts = useQuery(
    api.post.getPostsByUser,
    currentUser ? { userId: currentUser._id } : "skip"
  );

  // 3) Followers / Following
  const followersList = useQuery(
    api.user.getFollowers,
    currentUser ? { userId: currentUser._id } : "skip"
  );
  const followingList = useQuery(
    api.user.getFollowing,
    currentUser ? { userId: currentUser._id } : "skip"
  );

  // 4) Profile editing
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editedProfile, setEditedProfile] = useState({ fullname: "", bio: "" });
  const updateProfile = useMutation(api.user.updateProfile);

  useEffect(() => {
    if (currentUser) {
      setEditedProfile({
        fullname: currentUser.fullname,
        bio: currentUser.bio || "",
      });
    }
  }, [currentUser]);

  const handleSaveProfile = async () => {
    await updateProfile(editedProfile);
    setIsEditModalVisible(false);
  };

  // 5) Followers / Following modals
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);

  // Wait for all data
  if (
    !currentUser ||
    posts === undefined ||
    followersList === undefined ||
    followingList === undefined
  ) {
    return <Loader />;
  }

  // Sort so newest posts appear first (top-left)
  const sortedPosts = [...posts].sort(
    (a, b) => b._creationTime - a._creationTime
  );

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.username}>{currentUser.username}</Text>
        <TouchableOpacity onPress={() => signOut()} style={styles.headerIcon}>
          <Ionicons name="log-out-outline" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* PROFILE INFO */}
        <View style={styles.profileInfo}>
          <View style={styles.avatarAndStats}>
            <Image
              source={currentUser.image}
              style={styles.avatar}
              contentFit="cover"
            />
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{sortedPosts.length}</Text>
                <Text style={styles.statLabel}>Posts</Text>
              </View>
              <TouchableOpacity
                style={styles.statItem}
                onPress={() => setShowFollowers(true)}
              >
                <Text style={styles.statNumber}>
                  {currentUser.followers}
                </Text>
                <Text style={styles.statLabel}>Followers</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.statItem}
                onPress={() => setShowFollowing(true)}
              >
                <Text style={styles.statNumber}>
                  {currentUser.following}
                </Text>
                <Text style={styles.statLabel}>Following</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.name}>{currentUser.fullname}</Text>
          {currentUser.bio ? (
            <Text style={styles.bio}>{currentUser.bio}</Text>
          ) : null}

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditModalVisible(true)}
            >
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareButton}>
              <Ionicons name="share-outline" size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* POSTS GRID */}
        {sortedPosts.length === 0 ? (
          <NoPostsFound />
        ) : (
          <FlatList
            data={sortedPosts}
            numColumns={3}
            scrollEnabled={false}
            keyExtractor={(p) => p._id}
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
                />
              </TouchableOpacity>
            )}
          />
        )}
      </ScrollView>

      {/* EDIT PROFILE MODAL */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            style={styles.modalContainer}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Profile</Text>
                <TouchableOpacity
                  onPress={() => setIsEditModalVisible(false)}
                  style={styles.headerIcon}
                >
                  <Ionicons name="close" size={24} color={COLORS.white} />
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Name</Text>
                <TextInput
                  style={styles.input}
                  value={editedProfile.fullname}
                  onChangeText={(t) =>
                    setEditedProfile((p) => ({ ...p, fullname: t }))
                  }
                  placeholderTextColor={COLORS.grey}
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Bio</Text>
                <TextInput
                  style={[styles.input, styles.bioInput]}
                  value={editedProfile.bio}
                  onChangeText={(t) =>
                    setEditedProfile((p) => ({ ...p, bio: t }))
                  }
                  multiline
                  numberOfLines={4}
                  placeholderTextColor={COLORS.grey}
                />
              </View>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveProfile}
              >
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>

      {/* FOLLOWERS LIST */}
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
            data={followersList}
            keyExtractor={(u) => u._id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.listItem}
                onPress={() => {
                  setShowFollowers(false);
                  router.push(`/user/${item._id}`);
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

      {/* FOLLOWING LIST */}
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
            data={followingList}
            keyExtractor={(u) => u._id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.listItem}
                onPress={() => {
                  setShowFollowing(false);
                  router.push(`/user/${item._id}`);
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

function NoPostsFound() {
  return (
    <View style={styles.noPostsContainer}>
      <Ionicons name="images-outline" size={48} color={COLORS.primary} />
      <Text style={styles.noPostsText}>No posts yet</Text>
    </View>
  );
}
