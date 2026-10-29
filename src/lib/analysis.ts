import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "@/lib/firebase";
const API_BASE_URL = "http://10.0.2.2:3001";

export type MarkerStatus = "High" | "Low" | "Normal";

export type Marker = {
  name: string;
  value: string;
  numericValue: number | null;
  unit: string;
  rangeText: string;
  status: MarkerStatus;
  meaning: string;
  howToImprove: string;
};

export type ReportAnalysis = {
  id: string;
  fileName: string;
  reportType: string;
  summary: string;
  markers: Marker[];
  nextSteps: string[];
  createdAt: number;
};

// Everything is stored under the signed-in user's id, so one phone can hold
// several accounts without mixing their reports.
const storageKey = (uid: string) => `veyra:${uid}:analyses`;

function getUid(): string | null {
  return auth?.currentUser?.uid ?? null;
}

export async function listAnalyses(): Promise<ReportAnalysis[]> {
  const uid = getUid();
  if (!uid) return [];

  try {
    const raw = await AsyncStorage.getItem(storageKey(uid));
    const list: ReportAnalysis[] = raw ? JSON.parse(raw) : [];
    return list.sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    return [];
  }
}

export async function deleteAnalysis(id: string) {
  const uid = getUid();
  if (!uid) return;

  const list = await listAnalyses();
  await AsyncStorage.setItem(
    storageKey(uid),
    JSON.stringify(list.filter((item) => item.id !== id))
  );
}

export async function clearAllAnalyses() {
  const uid = getUid();
  if (!uid) return;
  await AsyncStorage.removeItem(storageKey(uid));
}

type AnalyzeResponse = {
  isHealthReport?: boolean;
  reportType?: string;
  summary?: string;
  markers?: Marker[];
  nextSteps?: string[];
  error?: string;
};

async function requestAnalysis(text: string): Promise<AnalyzeResponse | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 90_000);

  try {
    const response = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ text }),
      signal: controller.signal,
    });

    const raw = await response.text();
    const data = JSON.parse(raw) as AnalyzeResponse;

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }
    return data;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Sends extracted report text to the backend, and saves the structured result
 * for the current user. Never throws: a failure here must not break the chat.
 * Returns the saved analysis, or null if nothing was saved.
 */
export async function analyzeAndSave(
  fileName: string,
  text: string
): Promise<ReportAnalysis | null> {
  try {
    const uid = getUid();
    if (!uid) return null;

    const data = await requestAnalysis(text.slice(0, 12000));

    if (
      !data ||
      data.isHealthReport === false ||
      !Array.isArray(data.markers) ||
      data.markers.length === 0
    ) {
      return null;
    }

    const entry: ReportAnalysis = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      fileName,
      reportType: data.reportType?.trim() || "Health report",
      summary: data.summary?.trim() || "",
      markers: data.markers,
      nextSteps: Array.isArray(data.nextSteps) ? data.nextSteps : [],
      createdAt: Date.now(),
    };

    const existing = await listAnalyses();
    await AsyncStorage.setItem(
      storageKey(uid),
      JSON.stringify([entry, ...existing].slice(0, 100))
    );

    return entry;
  } catch (error) {
    console.warn("Report analysis failed:", error);
    return null;
  }
}
