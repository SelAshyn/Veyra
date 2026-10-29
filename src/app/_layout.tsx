import { auth } from "@/lib/firebase";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    View,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

const BACKGROUND = "#111513";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Restore the user's Firebase session.
  useEffect(() => {
    if (!auth) {
      setIsLoggedIn(false);
      setIsAuthReady(true);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
      setIsAuthReady(true);
    });

    return unsubscribe;
  }, []);

  // Protect authenticated routes while keeping the welcome screen public.
  useEffect(() => {
    if (!isAuthReady) return;

    const firstSegment = segments[0];

    const isAuthScreen =
      firstSegment === "login" ||
      firstSegment === "signup" ||
      firstSegment === "forgot-password";

    const isWelcomeScreen =
      firstSegment === undefined;

    if (!isLoggedIn && !isAuthScreen && !isWelcomeScreen) {
      // Logged-out users can access the welcome page.
      router.replace("/");
    } else if (isLoggedIn && (isAuthScreen || isWelcomeScreen)) {
      // Returning users with a valid session go straight to the app.
      router.replace("/(tabs)");
    }
  }, [isAuthReady, isLoggedIn, segments, router]);

  if (!isAuthReady) {
    return (
      <SafeAreaProvider>
        <View style={styles.loadingScreen}>
          <StatusBar
            style="light"
            backgroundColor={BACKGROUND}
          />
          <ActivityIndicator
            size="large"
            color="#35BDB3"
          />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar
        style="light"
        backgroundColor={BACKGROUND}
      />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: BACKGROUND,
          },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="history"
          options={{
            presentation: "modal",
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    backgroundColor: BACKGROUND,
    alignItems: "center",
    justifyContent: "center",
  },
});
