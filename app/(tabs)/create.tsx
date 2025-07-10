// app/(tabs)/create.tsx

import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useMutation } from "convex/react";
import * as FileSystem from "expo-file-system";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { styles } from "@/styles/create.styles";

const HOME_ROUTE = "/(tabs)";

export default function CreateScreen() {
  const router = useRouter();
  const { user } = useUser();

  // local state
  const [caption, setCaption] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  // Convex mutations
  const generateUploadUrl = useMutation(api.post.generateUploadUrl);
  const createPost = useMutation(api.post.createPost);

  // Reset state on focus
  useFocusEffect(
    useCallback(() => {
      setCaption("");
      setSelectedImage(null);
      return () => {};
    }, [])
  );

  // pick from gallery
  const pickImage = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  }, []);

  // take a new photo
  const openCamera = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      alert("Camera permission is required to take a photo.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  }, []);

  // share handler
  const handleShare = useCallback(async () => {
    if (!selectedImage) return;

    setIsSharing(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const uploadResult = await FileSystem.uploadAsync(
        uploadUrl,
        selectedImage,
        {
          httpMethod: "POST",
          uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
          mimeType: "image/jpeg",
        }
      );

      if (uploadResult.status !== 200) {
        throw new Error("Upload failed");
      }

      const { storageId } = JSON.parse(uploadResult.body);
      await createPost({ storageId, caption });

      router.push(HOME_ROUTE);
    } catch (error) {
      console.error("Error sharing the post:", error);
    } finally {
      setIsSharing(false);
    }
  }, [selectedImage, caption, generateUploadUrl, createPost, router]);

  // If no image yet, show picker + camera options
  if (!selectedImage) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color={COLORS.primary} />
          </TouchableOpacity>
          <View style={localStyles.headerTitle}>
            <Text style={localStyles.headerText}>New Post</Text>
          </View>
          <View style={{ width: 28 }} />
        </View>

        <View style={localStyles.choiceContainer}>
          <TouchableOpacity
            style={styles.emptyImageContainer}
            onPress={pickImage}
          >
            <Ionicons name="image-outline" size={48} color={COLORS.grey} />
            <Text style={styles.emptyImageText}>Select from Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.emptyImageContainer}
            onPress={openCamera}
          >
            <Ionicons name="camera-outline" size={48} color={COLORS.grey} />
            <Text style={styles.emptyImageText}>Use Camera</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Otherwise show caption + share UI
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
        style={styles.container}
      >
        <View style={styles.contentContainer}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => {
                setSelectedImage(null);
                setCaption("");
              }}
              disabled={isSharing}
            >
              <Ionicons
                name="close-outline"
                size={28}
                color={isSharing ? COLORS.grey : COLORS.white}
              />
            </TouchableOpacity>

            <View style={localStyles.headerTitle}>
              <Text style={localStyles.headerText}>New Post</Text>
            </View>

            <TouchableOpacity
              style={[
                styles.shareButton,
                isSharing && styles.shareButtonDisabled,
              ]}
              onPress={handleShare}
              disabled={isSharing || !selectedImage}
            >
              {isSharing ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <Text style={styles.shareText}>Share</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            bounces={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.content}>
              <View style={styles.imageSection}>
                <Image
                  source={{ uri: selectedImage }}
                  style={styles.previewImage}
                  contentFit="cover"
                  transition={200}
                />
                <TouchableOpacity
                  style={styles.changeImageButton}
                  onPress={pickImage}
                  disabled={isSharing}
                >
                  <Ionicons name="image-outline" size={20} color={COLORS.white} />
                  <Text style={styles.changeImageText}>Change</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputSection}>
                <View style={styles.captionContainer}>
                  <Image
                    source={user?.imageUrl}
                    style={styles.userAvatar}
                    contentFit="cover"
                    transition={200}
                  />
                  <TextInput
                    style={styles.captionInput}
                    placeholder="Write a caption..."
                    placeholderTextColor={COLORS.grey}
                    multiline
                    value={caption}
                    onChangeText={setCaption}
                    editable={!isSharing}
                  />
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  headerTitle: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  headerText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.white,
  },
  choiceContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 20, // space between the two buttons
  },
});
