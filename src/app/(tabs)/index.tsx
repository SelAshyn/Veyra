import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import { router, useLocalSearchParams } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import Markdown from "react-native-markdown-display";
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
} from "expo-audio";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { sendChatMessage } from "@/lib/api";
import { analyzeAndSave } from "@/lib/analysis";
import { buildChat, loadChat, saveChat } from "@/lib/history";
import {
  extractDocumentText,
  transcribeAudio,
} from "@/lib/processing";

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

// Removes stray HTML (like <br>) that the model sometimes adds
function cleanReply(text: string) {
  return text
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/&nbsp;/g, " ")
    .replace(/<\/?[^>]+>/g, "")
    .trim();
}

const markdownStyles = {
  body: { color: COLORS.text, fontSize: 14, lineHeight: 21 },
  paragraph: { marginTop: 0, marginBottom: 8 },
  strong: { fontWeight: "700" as const, color: COLORS.text },
  em: { fontStyle: "italic" as const },
  heading1: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "700" as const,
    marginBottom: 6,
  },
  heading2: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "700" as const,
    marginTop: 6,
    marginBottom: 6,
  },
  heading3: {
    color: COLORS.teal,
    fontSize: 14,
    fontWeight: "700" as const,
    marginTop: 6,
    marginBottom: 4,
  },
  bullet_list: { marginBottom: 6 },
  ordered_list: { marginBottom: 6 },
  list_item: { marginBottom: 4 },
  hr: { backgroundColor: COLORS.border, height: 1, marginVertical: 8 },
  code_inline: {
    backgroundColor: COLORS.surfaceLight,
    color: COLORS.text,
    borderRadius: 4,
    paddingHorizontal: 4,
  },
};

type Attachment = {
  id: string;
  name: string;
  uri: string;
  type: "pdf" | "image" | "audio";
  mimeType?: string;
};

type ChatMessage = {
  id: string;
  text: string;
  sender: "user" | "assistant";
};

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  // The history page opens a chat (or a fresh one) by sending a new "t" value
  const params = useLocalSearchParams<{ chatId?: string; t?: string }>();

  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatId, setChatId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSending, setIsSending] = useState(false);

  function startNewChat() {
    if (isSending) return;
    setMessages([]);
    setChatId(null);
    setMessage("");
    setAttachments([]);
  }

  useEffect(() => {
    if (!params.t) return;
    let active = true;

    if (params.chatId) {
      loadChat(params.chatId).then((chat) => {
        if (!active || !chat) return;
        setMessages(chat.messages);
        setChatId(chat.id);
      });
    } else {
      startNewChat();
    }

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.t]);

  async function pickPDF() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true, // gives a readable cache copy
        multiple: false,
      });

      if (result.canceled) return;

      const file = result.assets[0];

      setAttachments((current) => [
        ...current,
        {
          id: `${Date.now()}-${Math.random()}`,
          name: file.name,
          uri: file.uri, // already a readable cache copy
          type: "pdf",
          mimeType: file.mimeType ?? "application/pdf",
        },
      ]);
    } catch (error) {
      Alert.alert(
        "Could not attach PDF",
        error instanceof Error
          ? error.message
          : "Please try selecting the file again."
      );
    }
  }

  async function pickImage() {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Photo permission needed",
          "Allow photo-library access to attach an image."
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
      const imageName = image.fileName ?? "health-image.jpg";

      setAttachments((current) => [
        ...current,
        {
          id: `${Date.now()}-${Math.random()}`,
          name: imageName,
          uri: image.uri,
          type: "image",
          mimeType: image.mimeType ?? "image/jpeg",
        },
      ]);
    } catch (error) {
      Alert.alert(
        "Could not attach image",
        error instanceof Error ? error.message : "Please try again."
      );
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
    if (isTranscribing || isSending) return;

    try {
      if (isRecording) {
        await recorder.stop();
        setIsRecording(false);

        const audioUri = recorder.uri;

        if (!audioUri) {
          Alert.alert(
            "Recording unavailable",
            "The audio file could not be found. Please try again."
          );
          return;
        }

        const audioName =
          audioUri.split("/").pop() || "voice-note.m4a";
        const extension = audioName.split(".").pop()?.toLowerCase();

        const mimeTypes: Record<string, string> = {
          wav: "audio/wav",
          mp3: "audio/mpeg",
          m4a: "audio/mp4",
          aac: "audio/aac",
          ogg: "audio/ogg",
          webm: "audio/webm",
          mp4: "audio/mp4",
          flac: "audio/flac",
        };

        setIsTranscribing(true);

        try {
          const result = await transcribeAudio({
            uri: audioUri,
            name: audioName,
            mimeType: mimeTypes[extension ?? ""] ?? "audio/mp4",
            type: "audio",
          });

          const transcript = result.text.trim();

          if (!transcript) {
            Alert.alert(
              "No speech detected",
              "Try recording again in a quieter environment."
            );
            return;
          }

          setMessage((current) =>
            current.trim()
              ? `${current.trim()} ${transcript}`
              : transcript
          );

          Alert.alert(
            "Transcription complete",
            `Language: ${result.language ?? "Unknown"}\n\nThe transcript is in your message box. Review it before sending.`
          );
        } catch (error) {
          Alert.alert(
            "Transcription failed",
            error instanceof Error
              ? error.message
              : "Could not transcribe the recording."
          );
        } finally {
          setIsTranscribing(false);
        }

        return;
      }

      const permission =
        await AudioModule.requestRecordingPermissionsAsync();

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
    } catch (error) {
      setIsRecording(false);
      setIsTranscribing(false);

      Alert.alert(
        "Voice recording unavailable",
        error instanceof Error
          ? error.message
          : "Check microphone permissions and try again."
      );
    }
  }

  async function sendMessage() {
    const question = message.trim();

    if ((!question && attachments.length === 0) || isSending) return;

    setIsSending(true);

    try {
      let documentContext = "";
      const extractedReports: { name: string; text: string }[] = [];

      for (const file of attachments) {
        if (file.type === "audio") {
          throw new Error(
            "Please transcribe the audio before sending your message."
          );
        }

        const result = await extractDocumentText({
          uri: file.uri,
          name: file.name,
          mimeType: file.mimeType,
          type: file.type,
        });

        if (!result.text.trim()) {
          throw new Error(
            result.message ||
              `No readable text was found in ${file.name}.`
          );
        }

        // Kept for the Analysis tab (analysed in the background after the reply)
        extractedReports.push({ name: file.name, text: result.text });

        const remaining = Math.max(
          0,
          10000 - documentContext.length
        );

        if (remaining > 0) {
          documentContext +=
            `\n\nDocument: ${file.name}\n` +
            result.text.slice(0, remaining);
        }
      }

      const userQuestion =
        question || "Please explain the attached document.";

      const prompt = documentContext
        ? `${userQuestion}\n\n--- REPORT TEXT (extracted automatically, may contain scan errors) ---${documentContext}\n--- END OF REPORT ---\n\nCheck every test in this report. List all HIGH and LOW results with what they mean and how to improve them, then the normal ones in one line. Skip patient and lab details.`
        : userQuestion;

      if (prompt.length > 14000) {
        throw new Error(
          "The message is too long for the backend. Shorten your question or attach fewer documents."
        );
      }

      const history = messages.map((item) => ({
        role: item.sender,
        content: item.text,
      }));

      const reply = await sendChatMessage(prompt, history);

      const attachmentNames = attachments
        .map((file) => file.name)
        .join(", ");

      const userDisplay = attachments.length
        ? `${userQuestion}\n\nAttachments: ${attachmentNames}`
        : userQuestion;

      const timestamp = Date.now();

      const next: ChatMessage[] = [
        ...messages,
        { id: `${timestamp}-user`, text: userDisplay, sender: "user" },
        { id: `${timestamp}-assistant`, text: reply, sender: "assistant" },
      ];

      setMessages(next);

      // Save this conversation to the History tab
      const id = chatId ?? String(timestamp);
      setChatId(id);
      void saveChat(buildChat(id, next));

      setMessage("");
      setAttachments([]);

      // Save structured results to the Analysis tab (never blocks or breaks the chat)
      if (extractedReports.length > 0) {
        void (async () => {
          for (const report of extractedReports) {
            await analyzeAndSave(report.name, report.text);
          }
        })();
      }
    } catch (error) {
      Alert.alert(
        "Could not send message",
        error instanceof Error
          ? error.message
          : "Check that both backend servers are running and try again."
      );
    } finally {
      setIsSending(false);
    }
  }

  return (
    <View style={styles.screen}>
      <StatusBar
        barStyle="light-content"
      />

      <KeyboardAvoidingView
        style={styles.keyboardArea}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <View
          style={[
            styles.header,
            { paddingTop: Math.max(insets.top, 12) },
          ]}
        >
          <View style={styles.brandRow}>
            <View style={styles.logo}>
              <Feather
                name="activity"
                size={22}
                color={COLORS.teal}
              />
            </View>
            <View>
              <Text style={styles.brandTitle}>Health Insight</Text>
              <Text style={styles.brandSubtitle}>
                YOUR HEALTH COMPANION
              </Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={startNewChat}
              accessibilityLabel="Start a new chat"
            >
              <Feather name="plus" size={20} color={COLORS.text} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => router.push("/(tabs)/history")}
              accessibilityLabel="Open chat history"
            >
              <Feather name="clock" size={20} color={COLORS.text} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.conversation}
          contentContainerStyle={styles.conversationContent}
          keyboardShouldPersistTaps="handled"
        >
          {messages.length === 0 ? (
            <View style={styles.welcome}>
              <View style={styles.heroLogo}>
                <Feather
                  name="activity"
                  size={42}
                  color={COLORS.teal}
                />
              </View>

              <Text style={styles.welcomeTitle}>
                Your health, understood.
              </Text>
              <Text style={styles.welcomeText}>
                Ask a question or attach a health report or image to get
                started.
              </Text>

              <View style={styles.suggestionList}>
                <TouchableOpacity
                  style={styles.suggestion}
                  onPress={() =>
                    setMessage("Help me understand my health report.")
                  }
                >
                  <Feather
                    name="file-text"
                    size={18}
                    color={COLORS.teal}
                  />
                  <Text style={styles.suggestionText}>
                    Help me understand a report
                  </Text>
                  <Feather
                    name="arrow-up-left"
                    size={16}
                    color={COLORS.muted}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.suggestion}
                  onPress={() =>
                    setMessage("What questions should I ask my doctor?")
                  }
                >
                  <Feather
                    name="message-circle"
                    size={18}
                    color={COLORS.teal}
                  />
                  <Text style={styles.suggestionText}>
                    Prepare questions for my doctor
                  </Text>
                  <Feather
                    name="arrow-up-left"
                    size={16}
                    color={COLORS.muted}
                  />
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
                  {item.sender === "assistant" ? (
                    <Markdown style={markdownStyles}>
                      {cleanReply(item.text)}
                    </Markdown>
                  ) : (
                    <Text style={styles.messageText}>{item.text}</Text>
                  )}
                </View>
              ))}

              {isSending && (
                <View style={styles.statusRow}>
                  <ActivityIndicator color={COLORS.teal} size="small" />
                  <Text style={styles.processingText}>
                    Reading attachments and asking Veyra…
                  </Text>
                </View>
              )}
            </View>
          )}

          {messages.length === 0 && isSending && (
            <View style={styles.statusRow}>
              <ActivityIndicator color={COLORS.teal} size="small" />
              <Text style={styles.processingText}>
                Reading attachments and asking Veyra…
              </Text>
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
                  disabled={isSending}
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
              disabled={isSending || isTranscribing || isRecording}
            >
              <Feather
                name="paperclip"
                size={21}
                color={COLORS.muted}
              />
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
              editable={!isSending && !isTranscribing}
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
              disabled={isSending || isTranscribing}
            >
              {isTranscribing ? (
                <ActivityIndicator color={COLORS.teal} size="small" />
              ) : (
                <Feather
                  name={isRecording ? "square" : "mic"}
                  size={19}
                  color={isRecording ? "#FF8A80" : COLORS.muted}
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.sendButton,
                isSending && styles.sendButtonDisabled,
              ]}
              onPress={() => void sendMessage()}
              accessibilityLabel="Send message"
              disabled={isSending || isTranscribing || isRecording}
            >
              {isSending ? (
                <ActivityIndicator color="#10201C" size="small" />
              ) : (
                <Feather
                  name="arrow-up"
                  size={21}
                  color="#10201C"
                />
              )}
            </TouchableOpacity>
          </View>

          {isRecording && (
            <Text style={styles.recordingLabel}>
              Recording voice note… tap the microphone button to stop.
            </Text>
          )}

          {isTranscribing && (
            <Text style={styles.recordingLabel}>
              Transcribing your voice with AI…
            </Text>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  logo: {
    width: 43,
    height: 43,
    borderRadius: 15,
    backgroundColor: "#203A32",
    alignItems: "center",
    justifyContent: "center",
  },
  brandTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "700",
  },
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
  conversation: {
    flex: 1,
  },
  conversationContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 22,
  },
  welcome: {
    alignItems: "center",
    width: "100%",
  },
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
  suggestionList: {
    width: "100%",
    marginTop: 30,
    gap: 10,
  },
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
  suggestionText: {
    color: COLORS.text,
    fontSize: 13,
    flex: 1,
  },
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
  messages: {
    gap: 12,
    paddingVertical: 12,
  },
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
  messageText: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 21,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
  },
  processingText: {
    color: COLORS.muted,
    fontSize: 12,
  },
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
  attachmentName: {
    color: COLORS.text,
    fontSize: 11,
    maxWidth: 145,
  },
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
  recordingButton: {
    backgroundColor: "#492C2C",
    borderRadius: 13,
  },
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
  sendButtonDisabled: {
    opacity: 0.65,
  },
  recordingLabel: {
    color: "#FF8A80",
    fontSize: 11,
    textAlign: "center",
    paddingTop: 7,
  },
});
