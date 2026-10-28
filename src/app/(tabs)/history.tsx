
import React from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const C = {
  bg: "#111513",
  card: "#1A211E",
  card2: "#202A25",
  border: "#2B3732",
  text: "#F3F7F4",
  muted: "#9AA8A0",
  teal: "#35BDB3",
};

export default function HistoryScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace("/(tabs)/profile")}
        >
          <Feather name="arrow-left" size={17} color={C.text} />
          <Text style={styles.backText}>Back to Profile</Text>
        </TouchableOpacity>

        <View style={styles.heading}>
          <View style={styles.headingIcon}>
            <Feather name="clock" size={25} color={C.teal} />
          </View>
          <Text style={styles.title}>Chat History</Text>
          <Text style={styles.subtitle}>
            Your previous health conversations in one place.
          </Text>
        </View>

        <View style={styles.emptyCard}>
          <View style={styles.emptyIcon}>
            <Feather name="message-square" size={28} color={C.teal} />
          </View>

          <Text style={styles.emptyTitle}>No saved conversations yet</Text>

          <Text style={styles.emptyText}>
            Once conversation storage is connected, you will be able to revisit
            previous chats and their related health reports here.
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.replace("/(tabs)")}
          >
            <Feather name="plus" size={17} color={C.bg} />
            <Text style={styles.primaryButtonText}>Start a conversation</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <Feather name="info" size={17} color={C.teal} />
          <Text style={styles.infoText}>
            Chat history is not stored permanently yet. Conversations may
            disappear when the app reloads.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bg },
  content: { flexGrow: 1, padding: 19, paddingBottom: 30 },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 9,
    paddingVertical: 8,
  },
  backText: { color: C.text, fontSize: 12, fontWeight: "600" },
  heading: { alignItems: "center", marginTop: 36, marginBottom: 27 },
  headingIcon: {
    width: 58,
    height: 58,
    borderRadius: 19,
    backgroundColor: "#203A32",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: { color: C.text, fontSize: 26, fontWeight: "800" },
  subtitle: {
    color: C.muted,
    fontSize: 12,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 8,
  },
  emptyCard: {
    alignItems: "center",
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 22,
    padding: 23,
  },
  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: C.card2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 17,
  },
  emptyTitle: {
    color: C.text,
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  emptyText: {
    color: C.muted,
    fontSize: 12,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 9,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: C.teal,
    borderRadius: 13,
    paddingHorizontal: 17,
    paddingVertical: 13,
    marginTop: 22,
  },
  primaryButtonText: { color: C.bg, fontSize: 12, fontWeight: "800" },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 16,
    padding: 15,
    marginTop: 19,
  },
  infoText: { flex: 1, color: C.muted, fontSize: 11, lineHeight: 18 },
});
