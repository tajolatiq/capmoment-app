// styles/search.styles.ts

import { COLORS } from "@/constants/theme";
import { Dimensions, StyleSheet } from "react-native";

const { width } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.primary,    // ← pure white
    marginBottom: 12,
  },
  searchRow: {
    flexDirection: "row",
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 44,
    borderColor: COLORS.grey,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    color: COLORS.white,    // ← input text white
  },
  button: {
    marginLeft: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  buttonText: {
    color: COLORS.white,    // ← button text white
    fontWeight: "600",
  },
  result: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginTop: 16,
    borderRadius: 8,
    backgroundColor: "#111",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  username: {
    color: COLORS.white,   // ← username white
    fontSize: 16,
    fontWeight: "500",
  },
  notFound: {
    marginTop: 16,
    color: COLORS.white,   // ← error text white
    textAlign: "center",
  },
});
