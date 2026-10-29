import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { onAuthStateChanged, User } from "firebase/auth";
import { SafeAreaView } from "react-native-safe-area-context";
import { logout } from "@/lib/auth";
import { auth } from "@/lib/firebase";
import { clearAllAnalyses } from "@/lib/analysis";
import { clearAllChats } from "@/lib/history";

const C = {
  bg: "#111513",
  card: "#1A211E",
  card2: "#202A25",
  border: "#2B3732",
  text: "#F3F7F4",
  muted: "#9AA8A0",
  teal: "#35BDB3",
  red: "#F07878",
};

export default function ProfileScreen() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [user, setUser] = useState<User | null>(auth?.currentUser ?? null);

  // Keeps the name and email correct even if Firebase restores the session late
  useEffect(() => {
    if (!auth) return undefined;
    return onAuthStateChanged(auth, setUser);
  }, []);

  const name = user?.displayName?.trim() || "Health Insight user";
  const email = user?.email || "No email available";

  async function handleLogout() {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      await logout();
      router.replace("/login");
    } catch {
      Alert.alert("Could not log out", "Please try again.");
      setIsLoggingOut(false);
    }
  }

  function confirmLogout() {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: () => void handleLogout(),
      },
    ]);
  }

  function confirmDeleteData() {
    Alert.alert(
      "Delete saved health data?",
      "All chat history and report analyses stored on this phone for your account will be removed. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await Promise.all([clearAllAnalyses(), clearAllChats()]);
              Alert.alert("Done", "Your saved health data was deleted.");
            } catch {
              Alert.alert("Could not delete data", "Please try again.");
            }
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.eyebrow}>YOUR ACCOUNT</Text>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>
          Your account and Health Insight settings.
        </Text>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Feather name="user" size={31} color={C.teal} />
          </View>

          <Text style={styles.name}>{name}</Text>
          <Text style={styles.email}>{email}</Text>

          <View style={styles.signedInPill}>
            <View style={styles.signedInDot} />
            <Text style={styles.signedInText}>
              {user ? "Signed in" : "Not signed in"}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Your workspace</Text>

        <View style={styles.menuCard}>
          <MenuRow
            icon="bar-chart-2"
            title="Health analysis"
            subtitle="Review measurements and report explanations"
            onPress={() => router.navigate("/(tabs)/analysis")}
          />
          <View style={styles.separator} />
          <MenuRow
            icon="clock"
            title="Chat history"
            subtitle="Revisit saved conversations"
            onPress={() => router.navigate("/history")}
          />
          <View style={styles.separator} />
          <MenuRow
            icon="message-circle"
            title="Chat with Health Insight"
            subtitle="Ask a question or upload a report"
            onPress={() => router.navigate("/(tabs)")}
          />
        </View>

        <Text style={styles.sectionTitle}>Your data</Text>

        <View style={styles.menuCard}>
          <MenuRow
            icon="trash-2"
            title="Delete saved health data"
            subtitle="Removes chats and report analyses stored on this phone"
            onPress={confirmDeleteData}
            danger
          />
        </View>

        <Text style={styles.sectionTitle}>About Health Insight</Text>

        <View style={styles.aboutCard}>
          <View style={styles.aboutIcon}>
            <Feather name="shield" size={19} color={C.teal} />
          </View>
          <View style={styles.aboutContent}>
            <Text style={styles.aboutTitle}>Your health matters</Text>
            <Text style={styles.aboutText}>
              Health Insight helps explain health information. It does not
              diagnose conditions or replace professional medical advice.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.logoutButton, isLoggingOut && styles.disabled]}
          onPress={confirmLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <ActivityIndicator color={C.red} />
          ) : (
            <>
              <Feather name="log-out" size={17} color={C.red} />
              <Text style={styles.logoutText}>Log out</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.footer}>Health Insight Agent</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuRow({
  icon,
  title,
  subtitle,
  onPress,
  danger = false,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  title: string;
  subtitle: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <TouchableOpacity style={styles.menuRow} onPress={onPress}>
      <View style={[styles.menuIcon, danger && styles.menuIconDanger]}>
        <Feather name={icon} size={17} color={danger ? C.red : C.teal} />
      </View>

      <View style={styles.menuContent}>
        <Text style={[styles.menuTitle, danger && { color: C.red }]}>
          {title}
        </Text>
        <Text style={styles.menuSubtitle}>{subtitle}</Text>
      </View>

      <Feather name="chevron-right" size={17} color={C.muted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bg },
  content: { padding: 19, paddingBottom: 30 },
  eyebrow: {
    color: C.teal,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.4,
    marginTop: 5,
  },
  title: {
    color: C.text,
    fontSize: 28,
    fontWeight: "800",
    marginTop: 7,
  },
  subtitle: { color: C.muted, fontSize: 12, marginTop: 7 },
  profileCard: {
    alignItems: "center",
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 22,
    padding: 23,
    marginTop: 24,
    marginBottom: 27,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 25,
    backgroundColor: "#203A32",
    borderWidth: 1,
    borderColor: "#326356",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  name: { color: C.text, fontSize: 18, fontWeight: "700" },
  email: {
    color: C.muted,
    fontSize: 12,
    textAlign: "center",
    marginTop: 6,
  },
  signedInPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 11,
    paddingVertical: 7,
    backgroundColor: C.card2,
    borderRadius: 20,
    marginTop: 14,
  },
  signedInDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: C.teal,
  },
  signedInText: { color: C.teal, fontSize: 10, fontWeight: "700" },
  sectionTitle: {
    color: C.text,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 12,
  },
  menuCard: {
    backgroundColor: C.card,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 13,
    marginBottom: 25,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingVertical: 15,
  },
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: "#203A32",
    alignItems: "center",
    justifyContent: "center",
  },
  menuIconDanger: { backgroundColor: "#3A2323" },
  menuContent: { flex: 1 },
  menuTitle: { color: C.text, fontSize: 12, fontWeight: "700" },
  menuSubtitle: {
    color: C.muted,
    fontSize: 10,
    lineHeight: 16,
    marginTop: 4,
  },
  separator: { height: 1, backgroundColor: C.border },
  aboutCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 18,
    padding: 15,
    marginBottom: 23,
  },
  aboutIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: "#203A32",
    alignItems: "center",
    justifyContent: "center",
  },
  aboutContent: { flex: 1 },
  aboutTitle: { color: C.text, fontSize: 12, fontWeight: "700" },
  aboutText: { color: C.muted, fontSize: 11, lineHeight: 18, marginTop: 5 },
  logoutButton: {
    minHeight: 49,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: "#623A3A",
    borderRadius: 14,
  },
  disabled: { opacity: 0.6 },
  logoutText: { color: C.red, fontSize: 12, fontWeight: "700" },
  footer: {
    color: C.muted,
    fontSize: 10,
    textAlign: "center",
    marginTop: 20,
  },
});
