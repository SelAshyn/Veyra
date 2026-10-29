const API_BASE_URL = "http://10.0.2.2:3001"; // emulator only; use your PC's LAN IP on a real phone

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ChatResponse = {
  reply: string;
};

type ApiError = {
  error?: string;
  message?: string;
};

export async function sendChatMessage(
  message: string,
  history: ChatMessage[] = []
): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 60_000);

  try {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        message,
        history: history.slice(-20),
      }),
      signal: controller.signal,
    });

    const raw = await response.text();

    let data: (ChatResponse & ApiError) | null = null;
    try {
      data = JSON.parse(raw);
    } catch {
      // not JSON, handled below
    }

    if (!response.ok) {
      throw new Error(
        data?.error ||
          data?.message ||
          `Request failed (${response.status}): ${raw.slice(0, 150)}`
      );
    }

    if (!data || typeof data.reply !== "string") {
      throw new Error("The AI server returned an invalid response.");
    }

    return data.reply;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("The AI server took too long to respond.");
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
