// styles/profile.styles.ts

import { COLORS } from "@/constants/theme";
import { Dimensions, StyleSheet } from "react-native";

const { width, height } = Dimensions.get("window");

export const styles = StyleSheet.create({
  // ─── Container & Header ───────────────────────────────────────────────
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.surface,
    justifyContent: "space-between",
  },
  headerIcon: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.white,
  },

  // ─── Username (for your own profile screen) ───────────────────────────
  username: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.white,
  },

  // ─── Profile Info ───────────────────────────────────────────────────────
  profileInfo: {
    padding: 16,
  },
  avatarAndStats: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  statsContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    marginLeft: 24,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.white,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: COLORS.grey,
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.white,
    marginBottom: 4,
  },
  bio: {
    fontSize: 14,
    color: COLORS.white,
    lineHeight: 20,
  },

  // ─── Actions ────────────────────────────────────────────────────────────
  actionButtons: {
    flexDirection: "row",
    marginTop: 12,
    justifyContent: "space-between",
  },
  editButton: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 8,
  },
  editButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },
  shareButton: {
    width: 48,
    backgroundColor: COLORS.surface,
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  // ─── Grid of Posts ──────────────────────────────────────────────────────
  postsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridItem: {
    width: "33.33%",
    aspectRatio: 1,
    padding: 1,
  },
  gridImage: {
    flex: 1,
  },

  // ─── “No Posts” Fallback ────────────────────────────────────────────────
  noPostsContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 48,
  },
  noPostsText: {
    fontSize: 20,
    color: COLORS.white,
  },

  // ─── Edit-Profile Modal ─────────────────────────────────────────────────
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: height * 0.5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.white,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: COLORS.grey,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: 12,
    color: COLORS.white,
    fontSize: 16,
  },
  bioInput: {
    height: 100,
    textAlignVertical: "top",
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  saveButtonText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: "600",
  },

  // ─── Post-Detail Modal ──────────────────────────────────────────────────
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
  },
  postDetailContainer: {
    backgroundColor: COLORS.background,
    maxHeight: height * 0.9,
  },
  postDetailHeader: {
    padding: 12,
    alignItems: "flex-end",
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.surface,
  },
  postDetailImage: {
    width,
    height: width,
  },

  // ─── Follow / Following Button ─────────────────────────────────────────
  followButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  followingButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  followButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },
  followingButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },

  // ─── Followers/Following List Modal ────────────────────────────────────
  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.surface,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.white,
    marginLeft: 16,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  listAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  listUsername: {
    fontSize: 16,
    color: COLORS.white,
  },
});
