
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
} from "expo-audio";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const COLORS = {
  background: "#111513",
  surface: "#1A211E",
  surfaceLight: "#232C28",
  border: "#2B3732",
  text: "#F3F7F4",
  muted: "#9AA8A0",
  teal: "#35BDB3",
  green: "#315F4A",
};

type Attachment = {
  id: string;
  name: string;
  uri: string;
  type: "pdf" | "image" | "audio";
};

type ChatMessage = {
  id: string;
  text: string;
  sender: "user" | "assistant";
};

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isSending, setIsSending] = useState(false);

  async function pickPDF() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) return;

      const file = result.assets[0];

      setAttachments((current) => [
        ...current,
        {
          id: `${Date.now()}`,
          name: file.name,
          uri: file.uri,
          type: "pdf",
        },
      ]);
    } catch {
      Alert.alert("Could not attach PDF", "Please try selecting the file again.");
    }
  }

  async function pickImage() {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Photo permission needed",
          "Allow photo-library access to attach a health-related image."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 0.9,
      });

      if (result.canceled) return;

      const image = result.assets[0];

      setAttachments((current) => [
        ...current,
        {
          id: `${Date.now()}`,
          name: image.fileName ?? "Health image",
          uri: image.uri,
          type: "image",
        },
      ]);
    } catch {
      Alert.alert("Could not attach image", "Please try again.");
    }
  }

  function showAttachmentOptions() {
    Alert.alert("Attach a file", "Choose what you want to add.", [
      { text: "PDF document", onPress: () => void pickPDF() },
      { text: "Image", onPress: () => void pickImage() },
      { text: "Cancel", style: "cancel" },
    ]);
  }

  async function toggleRecording() {
    try {
      if (isRecording) {
        await recorder.stop();
        setIsRecording(false);

        if (recorder.uri) {
          setAttachments((current) => [
            ...current,
            {
              id: `${Date.now()}`,
              name: "Voice recording",
              uri: recorder.uri!,
              type: "audio",
            },
          ]);
          Alert.alert(
            "Recording saved",
            "The audio is attached locally. Speech transcription is not connected yet."
          );
        }
        return;
      }

      const permission = await AudioModule.requestRecordingPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Microphone permission needed",
          "Allow microphone access to record a voice note."
        );
        return;
      }

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      await recorder.prepareToRecordAsync();
      recorder.record();
      setIsRecording(true);
    } catch {
      setIsRecording(false);
      Alert.alert(
        "Voice recording unavailable",
        "Please check microphone permissions and try again."
      );
    }
  }

  function sendMessage() {
    const trimmed = message.trim();

    if (!trimmed && attachments.length === 0) return;

    const newMessage: ChatMessage = {
      id: `${Date.now()}`,
      text:
        trimmed ||
        `Attached ${attachments.length} file${attachments.length === 1 ? "" : "s"}.`,
      sender: "user",
    };

    setMessages((current) => [...current, newMessage]);
    setMessage("");
    setAttachments([]);
    setIsSending(true);

    // Connect your AI/backend endpoint here to analyse the message and files.
    setTimeout(() => {
      setIsSending(false);
      Alert.alert(
        "AI not connected yet",
        "Your message was added to this screen, but it has not been sent to an AI service. Connect your backend to enable health analysis."
      );
    }, 250);
  }

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <KeyboardAvoidingView
        style={styles.keyboardArea}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}>
          <View style={styles.brandRow}>
            <View style={styles.logo}>
              <Feather name="activity" size={22} color={COLORS.teal} />
            </View>
            <View>
              <Text style={styles.brandTitle}>Health Insight</Text>
              <Text style={styles.brandSubtitle}>YOUR HEALTH COMPANION</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.push("/(tabs)/history")}
            accessibilityLabel="Open chat history"
          >
            <Feather name="clock" size={20} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.conversation}
          contentContainerStyle={styles.conversationContent}
          keyboardShouldPersistTaps="handled"
        >
          {messages.length === 0 ? (
            <View style={styles.welcome}>
              <View style={styles.heroLogo}>
                <Feather name="activity" size={42} color={COLORS.teal} />
              </View>
              <Text style={styles.welcomeTitle}>Your health, understood.</Text>
              <Text style={styles.welcomeText}>
                Ask a question or attach a health report or image to get started.
              </Text>

              <View style={styles.suggestionList}>
                <TouchableOpacity
                  style={styles.suggestion}
                  onPress={() =>
                    setMessage("Help me understand my health report.")
                  }
                >
                  <Feather name="file-text" size={18} color={COLORS.teal} />
                  <Text style={styles.suggestionText}>
                    Help me understand a report
                  </Text>
                  <Feather name="arrow-up-left" size={16} color={COLORS.muted} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.suggestion}
                  onPress={() =>
                    setMessage("What questions should I ask my doctor?")
                  }
                >
                  <Feather name="message-circle" size={18} color={COLORS.teal} />
                  <Text style={styles.suggestionText}>
                    Prepare questions for my doctor
                  </Text>
                  <Feather name="arrow-up-left" size={16} color={COLORS.muted} />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.messages}>
              {messages.map((item) => (
                <View
                  key={item.id}
                  style={[
                    styles.messageBubble,
                    item.sender === "user"
                      ? styles.userBubble
                      : styles.assistantBubble,
                  ]}
                >
                  <Text style={styles.messageText}>{item.text}</Text>
                </View>
              ))}
              {isSending && (
                <Text style={styles.processingText}>Preparing message…</Text>
              )}
            </View>
          )}

          <View style={styles.disclaimer}>
            <Feather name="shield" size={14} color={COLORS.muted} />
            <Text style={styles.disclaimerText}>
              For information only—not a diagnosis or a substitute for
              professional medical advice.
            </Text>
          </View>
        </ScrollView>

        {attachments.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.attachmentList}
          >
            {attachments.map((file) => (
              <View key={file.id} style={styles.attachmentChip}>
                <Feather
                  name={
                    file.type === "pdf"
                      ? "file-text"
                      : file.type === "image"
                        ? "image"
                        : "mic"
                  }
                  size={15}
                  color={COLORS.teal}
                />
                <Text style={styles.attachmentName} numberOfLines={1}>
                  {file.name}
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    setAttachments((current) =>
                      current.filter((item) => item.id !== file.id)
                    )
                  }
                  accessibilityLabel={`Remove ${file.name}`}
                >
                  <Feather name="x" size={15} color={COLORS.muted} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}

        <View
          style={[
            styles.composerWrap,
            { paddingBottom: Math.max(insets.bottom, 10) },
          ]}
        >
          <View style={styles.composer}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={showAttachmentOptions}
              accessibilityLabel="Attach PDF or image"
            >
              <Feather name="paperclip" size={21} color={COLORS.muted} />
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              value={message}
              onChangeText={setMessage}
              placeholder="Ask about your health..."
              placeholderTextColor="#829088"
              multiline
              maxLength={3000}
              returnKeyType="default"
            />

            <TouchableOpacity
              style={[
                styles.iconButton,
                isRecording && styles.recordingButton,
              ]}
              onPress={() => void toggleRecording()}
              accessibilityLabel={
                isRecording ? "Stop voice recording" : "Record a voice note"
              }
            >
              <Feather
                name={isRecording ? "square" : "mic"}
                size={19}
                color={isRecording ? "#FF8A80" : COLORS.muted}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sendButton}
              onPress={sendMessage}
              accessibilityLabel="Send message"
            >
              <Feather name="arrow-up" size={21} color="#10201C" />
            </TouchableOpacity>
          </View>

          {isRecording && (
            <Text style={styles.recordingLabel}>
              Recording voice note… tap the microphone button to stop.
            </Text>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  keyboardArea: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 11 },
  logo: {
    width: 43,
    height: 43,
    borderRadius: 15,
    backgroundColor: "#203A32",
    alignItems: "center",
    justifyContent: "center",
  },
  brandTitle: { color: COLORS.text, fontSize: 17, fontWeight: "700" },
  brandSubtitle: {
    color: COLORS.muted,
    fontSize: 9,
    letterSpacing: 1.3,
    marginTop: 3,
  },
  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  conversation: { flex: 1 },
  conversationContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 22,
  },
  welcome: { alignItems: "center", width: "100%" },
  heroLogo: {
    width: 92,
    height: 92,
    borderRadius: 30,
    backgroundColor: "#203A32",
    borderWidth: 1,
    borderColor: "#326356",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 25,
  },
  welcomeTitle: {
    color: COLORS.text,
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: -0.6,
  },
  welcomeText: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
    marginTop: 11,
    maxWidth: 300,
  },
  suggestionList: { width: "100%", marginTop: 30, gap: 10 },
  suggestion: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 15,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
  },
  suggestionText: { color: COLORS.text, fontSize: 13, flex: 1 },
  disclaimer: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "center",
    gap: 7,
    marginTop: 25,
    paddingHorizontal: 5,
  },
  disclaimerText: {
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 15,
    textAlign: "center",
    flex: 1,
  },
  messages: { gap: 12, paddingVertical: 12 },
  messageBubble: {
    maxWidth: "88%",
    borderRadius: 18,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: COLORS.green,
    borderBottomRightRadius: 5,
  },
  assistantBubble: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: 5,
  },
  messageText: { color: COLORS.text, fontSize: 14, lineHeight: 21 },
  processingText: { color: COLORS.muted, fontSize: 12 },
  attachmentList: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 8,
  },
  attachmentChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    maxWidth: 220,
    paddingHorizontal: 10,
    paddingVertical: 9,
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 12,
  },
  attachmentName: { color: COLORS.text, fontSize: 11, maxWidth: 145 },
  composerWrap: {
    paddingHorizontal: 12,
    paddingTop: 8,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 5,
    padding: 7,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 23,
  },
  iconButton: {
    width: 38,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  recordingButton: { backgroundColor: "#492C2C", borderRadius: 13 },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14,
    maxHeight: 110,
    minHeight: 40,
    paddingTop: 10,
    paddingBottom: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 15,
    backgroundColor: COLORS.teal,
    alignItems: "center",
    justifyContent: "center",
  },
  recordingLabel: {
    color: "#FF8A80",
    fontSize: 11,
    textAlign: "center",
    paddingTop: 7,
  },
});
