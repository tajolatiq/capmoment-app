// app/(tabs)/search.tsx

import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { styles } from "@/styles/search.styles";
import { useUser as useClerkUser } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function SearchUser() {
  // 1) Get the logged-in Clerk user
  const { user: clerkUser } = useClerkUser();

  // 2) Look up your own Convex record by their Clerk ID
  const myRecord = useQuery(api.user.getUserByClerkId, {
    clerkId: clerkUser?.id ?? "",
  });

  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState<string | null>(null);

  // 3) Only run the email lookup once submitted
  const foundUser = useQuery(
    api.user.getUserByEmail,
    submitted ? { email: submitted } : "skip"
  );

  const handleSearch = () => {
    const clean = email.trim().toLowerCase();
    if (clean) setSubmitted(clean);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Find a User</Text>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          placeholder="user@example.com"
          placeholderTextColor={COLORS.grey}
          selectionColor={COLORS.white}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.button} onPress={handleSearch}>
          <Text style={styles.buttonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Loading indicator while lookup is in flight */}
      {submitted && foundUser === undefined && (
        <ActivityIndicator style={{ marginTop: 20 }} color={COLORS.white} />
      )}

      {/* Once lookup returns */}
      {submitted && foundUser !== undefined && (
        foundUser ? (
          // 4a) If it's you, link to your Profile tab
          myRecord && foundUser._id === myRecord._id ? (
            <Link href="/profile" asChild>
              <TouchableOpacity style={styles.result}>
                <Image
                  source={{ uri: foundUser.image }}
                  style={styles.avatar}
                  contentFit="cover"
                />
                <Text style={styles.username}>{foundUser.username}</Text>
              </TouchableOpacity>
            </Link>
          ) : (
            // 4b) Otherwise, link to the public user page
            <Link
              href={{ pathname: "/user/[id]", params: { id: foundUser._id } }}
              asChild
            >
              <TouchableOpacity style={styles.result}>
                <Image
                  source={{ uri: foundUser.image }}
                  style={styles.avatar}
                  contentFit="cover"
                />
                <Text style={styles.username}>{foundUser.username}</Text>
              </TouchableOpacity>
            </Link>
          )
        ) : (
          <Text style={styles.notFound}>User not found</Text>
        )
      )}
    </View>
  );
}
