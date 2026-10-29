import {
    ChatSummary,
    clearAllChats,
    deleteChat,
    listChats,
} from "@/lib/history";
import { Feather } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
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
import { SafeAreaView } from "react-native-safe-area-context";

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

function formatWhen(timestamp: number) {
  const date = new Date(timestamp);
  const now = new Date();

  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: date.getFullYear() === now.getFullYear() ? undefined : "numeric",
  });
}

export default function HistoryScreen() {
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [loading, setLoading] = useState(true);

  // Reload every time the screen opens, so new chats appear straight away
  useFocusEffect(
    useCallback(() => {
      let active = true;

      listChats().then((list) => {
        if (!active) return;
        setChats(list);
        setLoading(false);
      });

      return () => {
        active = false;
      };
    }, [])
  );

  function goBack() {
    router.back();
  }

  // The unique "t" value tells the chat screen that a new request arrived,
  // even when the same chat is opened twice in a row.
  function openChat(id: string) {
    router.back();
    router.navigate({
      pathname: "/(tabs)/index",
      params: { chatId: id, t: String(Date.now()) },
    });
  }

  function startNewChat() {
    router.back();
    router.navigate({
      pathname: "/(tabs)/index",
      params: { t: String(Date.now()) },
    });
  }

  function confirmDelete(chat: ChatSummary) {
    Alert.alert("Delete this chat?", `"${chat.title}" will be removed from this phone.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteChat(chat.id);
          setChats((current) => current.filter((item) => item.id !== chat.id));
        },
      },
    ]);
  }

  function confirmClearAll() {
    Alert.alert(
      "Clear all chat history?",
      "Every saved conversation will be removed from this phone. Your report analyses are not affected.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear all",
          style: "destructive",
          onPress: async () => {
            await clearAllChats();
            setChats([]);
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Feather name="arrow-left" size={17} color={C.text} />
          <Text style={styles.backText}>Back</Text>
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

        {loading ? (
          <ActivityIndicator color={C.teal} style={{ marginTop: 30 }} />
        ) : chats.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Feather name="message-square" size={28} color={C.teal} />
            </View>

            <Text style={styles.emptyTitle}>No saved conversations yet</Text>

            <Text style={styles.emptyText}>
              Your chats are saved automatically. Start a conversation and it will show up here.
            </Text>

            <TouchableOpacity style={styles.primaryButton} onPress={startNewChat}>
              <Feather name="plus" size={17} color={C.bg} />
              <Text style={styles.primaryButtonText}>Start a conversation</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <TouchableOpacity style={styles.newChatButton} onPress={startNewChat}>
              <Feather name="plus" size={17} color={C.bg} />
              <Text style={styles.primaryButtonText}>New chat</Text>
            </TouchableOpacity>

            {chats.map((chat) => (
              <TouchableOpacity
                key={chat.id}
                style={styles.chatCard}
                onPress={() => openChat(chat.id)}
                activeOpacity={0.8}
              >
                <View style={styles.chatIcon}>
                  <Feather name="message-circle" size={18} color={C.teal} />
                </View>

                <View style={styles.chatInfo}>
                  <View style={styles.chatTitleRow}>
                    <Text style={styles.chatTitle} numberOfLines={1}>
                      {chat.title}
                    </Text>
                    <Text style={styles.chatWhen}>{formatWhen(chat.updatedAt)}</Text>
                  </View>

                  {chat.preview ? (
                    <Text style={styles.chatPreview} numberOfLines={2}>
                      {chat.preview}
                    </Text>
                  ) : null}

                  <Text style={styles.chatCount}>
                    {chat.messageCount} message{chat.messageCount === 1 ? "" : "s"}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => confirmDelete(chat)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  accessibilityLabel={`Delete ${chat.title}`}
                >
                  <Feather name="trash-2" size={17} color={C.muted} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={styles.clearButton} onPress={confirmClearAll}>
              <Feather name="trash-2" size={15} color={C.red} />
              <Text style={styles.clearText}>Clear all history</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={styles.infoCard}>
          <Feather name="info" size={17} color={C.teal} />
          <Text style={styles.infoText}>
            Chats are saved on this phone and linked to your account only. They are removed if you
            uninstall the app.
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
  heading: { alignItems: "center", marginTop: 28, marginBottom: 24 },
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
  newChatButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: C.teal,
    borderRadius: 13,
    paddingVertical: 13,
    marginBottom: 16,
  },
  chatCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 18,
    padding: 14,
    marginBottom: 11,
  },
  chatIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: "#203A32",
    alignItems: "center",
    justifyContent: "center",
  },
  chatInfo: { flex: 1 },
  chatTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  chatTitle: { flex: 1, color: C.text, fontSize: 13, fontWeight: "700" },
  chatWhen: { color: C.muted, fontSize: 10 },
  chatPreview: { color: C.muted, fontSize: 11, lineHeight: 17, marginTop: 5 },
  chatCount: { color: C.teal, fontSize: 10, fontWeight: "700", marginTop: 7 },
  clearButton: {
    minHeight: 47,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: "#623A3A",
    borderRadius: 14,
    marginTop: 8,
  },
  clearText: { color: C.red, fontSize: 12, fontWeight: "700" },
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
