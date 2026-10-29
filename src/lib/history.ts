import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "@/lib/firebase";

export type StoredMessage = {
  id: string;
  text: string;
  sender: "user" | "assistant";
};

export type ChatSummary = {
  id: string;
  title: string;
  preview: string;
  messageCount: number;
  updatedAt: number;
};

export type Chat = ChatSummary & { messages: StoredMessage[] };

// A small index (for the history list) plus one entry per chat, all under
// the signed-in user's id so accounts on the same phone never mix.
const indexKey = (uid: string) => `veyra:${uid}:index`;
const chatKey = (uid: string, id: string) => `veyra:${uid}:chat:${id}`;

function getUid(): string | null {
  return auth?.currentUser?.uid ?? null;
}

/** Builds the object to save from the current messages. */
export function buildChat(id: string, messages: StoredMessage[]): Chat {
  const firstUser = messages.find((m) => m.sender === "user");
  const title =
    firstUser?.text.split("\n")[0].trim().slice(0, 40) || "New chat";

  const last = messages[messages.length - 1];
  const preview = last
    ? last.text.replace(/[*#_`>|-]/g, " ").replace(/\s+/g, " ").trim().slice(0, 90)
    : "";

  return {
    id,
    title,
    preview,
    messageCount: messages.length,
    updatedAt: Date.now(),
    messages,
  };
}

export async function listChats(): Promise<ChatSummary[]> {
  const uid = getUid();
  if (!uid) return [];

  try {
    const raw = await AsyncStorage.getItem(indexKey(uid));
    const list: ChatSummary[] = raw ? JSON.parse(raw) : [];
    return list.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch {
    return [];
  }
}

export async function loadChat(id: string): Promise<Chat | null> {
  const uid = getUid();
  if (!uid) return null;

  try {
    const raw = await AsyncStorage.getItem(chatKey(uid, id));
    return raw ? (JSON.parse(raw) as Chat) : null;
  } catch {
    return null;
  }
}

export async function saveChat(chat: Chat) {
  const uid = getUid();
  if (!uid) return;

  try {
    const list = await listChats();

    const summary: ChatSummary = {
      id: chat.id,
      title: chat.title,
      preview: chat.preview,
      messageCount: chat.messageCount,
      updatedAt: chat.updatedAt,
    };

    await AsyncStorage.multiSet([
      [chatKey(uid, chat.id), JSON.stringify(chat)],
      [
        indexKey(uid),
        JSON.stringify([summary, ...list.filter((c) => c.id !== chat.id)]),
      ],
    ]);
  } catch (error) {
    console.warn("Could not save chat:", error);
  }
}

export async function deleteChat(id: string) {
  const uid = getUid();
  if (!uid) return;

  const list = await listChats();
  await AsyncStorage.removeItem(chatKey(uid, id));
  await AsyncStorage.setItem(
    indexKey(uid),
    JSON.stringify(list.filter((c) => c.id !== id))
  );
}

export async function clearAllChats() {
  const uid = getUid();
  if (!uid) return;

  const list = await listChats();
  await AsyncStorage.multiRemove([
    indexKey(uid),
    ...list.map((c) => chatKey(uid, c.id)),
  ]);
}
