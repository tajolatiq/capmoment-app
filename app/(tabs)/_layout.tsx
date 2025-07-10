
import { Loader } from "@/components/Loader";
import { COLORS } from "@/constants/theme";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import type { ComponentProps } from "react";

// Valid tab names
type TabName =
  | "index"
  | "search"
  | "bookmarks"
  | "create"
  | "notifications"
  | "profile";

// Icon names from Ionicons
type IconName = ComponentProps<typeof Ionicons>["name"];

interface TabItem {
  name: TabName;
  icon: IconName;
}

// Global tab navigator options
const TAB_SCREEN_OPTIONS = {
  unmountOnBlur: true,
  tabBarShowLabel: false,
  headerShown: false,
  tabBarActiveTintColor: COLORS.primary,
  tabBarInactiveTintColor: COLORS.grey,
  tabBarStyle: {
    backgroundColor: "black",
    borderTopWidth: 0,
    position: "absolute",
    elevation: 0,
    height: 40,
    paddingBottom: 8,
  },
} as const;

// List of tabs with icons
const TABS: TabItem[] = [
  { name: "index", icon: "home" },
  { name: "search", icon: "search" },
  { name: "bookmarks", icon: "bookmark" },
  { name: "create", icon: "add-circle" },
  { name: "notifications", icon: "heart" },
  { name: "profile", icon: "person-circle" },
];

export default function TabLayout() {
  // Guard: wait for Clerk auth to be loaded and user to be signed in
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded || !isSignedIn) {
    return <Loader />;
  }

  // Render the tab navigator once authenticated
  return (
    <Tabs screenOptions={TAB_SCREEN_OPTIONS}>
      {TABS.map(({ name, icon }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            tabBarIcon: ({ size, color }) => (
              <Ionicons name={icon} size={size} color={color} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
