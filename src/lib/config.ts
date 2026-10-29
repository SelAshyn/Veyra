import Constants from "expo-constants";
import { Platform } from "react-native";

function getHost(): string {
  // Manual override: set EXPO_PUBLIC_API_HOST=192.168.x.x in .env if auto-detect fails
  const override = process.env.EXPO_PUBLIC_API_HOST;
  if (override) return override;

  // Expo dev server host = your PC's LAN IP (works on a real phone in Expo Go)
  const hostUri =
    Constants.expoConfig?.hostUri ??
    (Constants as any).expoGoConfig?.debuggerHost;

  if (hostUri) return hostUri.split(":")[0];

  return Platform.OS === "android" ? "10.0.2.2" : "localhost";
}

const HOST = getHost();

export const API_BASE_URL = `http://${HOST}:3001`; // Node: chat
export const PROCESSING_API = `http://${HOST}:8000`; // Python: extract / transcribe
