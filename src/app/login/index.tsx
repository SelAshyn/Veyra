import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { login as firebaseLogin } from "@/lib/auth";
import { SafeAreaView } from "react-native-safe-area-context";

const COLORS = {
  background: "#111513",
  surface: "#1A211E",
  surfaceLight: "#232C28",
  border: "#2B3732",
  text: "#F3F7F4",
  muted: "#9AA8A0",
  teal: "#35BDB3",
  green: "#315F4A",
  iconBackground: "#203A32",
};

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert(
        "Missing information",
        "Please enter your email address and password."
      );
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      Alert.alert("Invalid email", "Please enter a valid email address.");
      return;
    }

    Keyboard.dismiss();
    setLoading(true);

    try {
      await firebaseLogin(email.trim(), password);
      router.replace("/(tabs)");
    } catch (error: any) {
      let message = "Unable to sign in. Please try again.";

      switch (error?.code) {
        case "auth/invalid-credential":
          message = "Incorrect email or password.";
          break;
        case "auth/invalid-email":
          message = "Please enter a valid email address.";
          break;
        case "auth/user-disabled":
          message = "This account has been disabled.";
          break;
        case "auth/too-many-requests":
          message = "Too many attempts. Please try again later.";
          break;
        case "auth/network-request-failed":
          message = "Network error. Check your internet connection.";
          break;
        case "app/firebase-not-configured":
          message =
            "Firebase is not configured. Check your .env file and restart Expo.";
          break;
      }

      Alert.alert("Login failed", message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* Brand */}
          <View style={styles.brand}>
            <View style={styles.logo}>
              <Feather
                name="activity"
                size={28}
                color={COLORS.teal}
              />
            </View>

            <Text style={styles.brandName}>Veyra</Text>
          </View>

          {/* Welcome heading */}
          <View style={styles.heading}>
            <Text style={styles.eyebrow}>YOUR HEALTH COMPANION</Text>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>
              Sign in to continue exploring your health insights.
            </Text>
          </View>

          {/* Login form */}
          <View style={styles.form}>
            <Text style={styles.label}>Email address</Text>

            <View style={styles.inputWrapper}>
              <Feather
                name="mail"
                size={18}
                color={COLORS.muted}
              />

              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor="#718078"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                textContentType="emailAddress"
                returnKeyType="next"
                editable={!loading}
                accessibilityLabel="Email address"
              />
            </View>

            <View style={styles.passwordLabelRow}>
              <Text style={styles.label}>Password</Text>

              <Pressable
                onPress={() => router.push("/forgot-password")}
                disabled={loading}
                accessibilityRole="button"
                hitSlop={8}
              >
                <Text style={styles.forgotLink}>Forgot password?</Text>
              </Pressable>
            </View>

            <View style={styles.inputWrapper}>
              <Feather
                name="lock"
                size={18}
                color={COLORS.muted}
              />

              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor="#718078"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="current-password"
                textContentType="password"
                returnKeyType="go"
                onSubmitEditing={handleLogin}
                editable={!loading}
                accessibilityLabel="Password"
              />

              <Pressable
                onPress={() => setShowPassword((previous) => !previous)}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel={
                  showPassword ? "Hide password" : "Show password"
                }
              >
                <Feather
                  name={showPassword ? "eye-off" : "eye"}
                  size={18}
                  color={COLORS.muted}
                />
              </Pressable>
            </View>

            <Pressable
              onPress={handleLogin}
              disabled={loading}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && !loading && styles.pressed,
                loading && styles.disabledButton,
              ]}
              accessibilityRole="button"
            >
              {loading ? (
                <ActivityIndicator color={COLORS.background} />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>Sign in</Text>
                  <Feather
                    name="arrow-right"
                    size={19}
                    color={COLORS.background}
                  />
                </>
              )}
            </Pressable>
          </View>

          {/* Secure sign-in divider */}
          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>SECURE SIGN IN</Text>
            <View style={styles.divider} />
          </View>

          {/* Privacy card */}
          <View style={styles.privacyCard}>
            <View style={styles.privacyIcon}>
              <Feather
                name="shield"
                size={19}
                color={COLORS.teal}
              />
            </View>

            <View style={styles.privacyContent}>
              <Text style={styles.privacyTitle}>
                Your privacy matters
              </Text>
              <Text style={styles.privacyDescription}>
                Access your account securely. Only upload health documents
                you are authorized to share.
              </Text>
            </View>
          </View>

          {/* Sign-up footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Don't have an account?
            </Text>

            <Pressable
              onPress={() => router.push("/signup")}
              disabled={loading}
              accessibilityRole="button"
              hitSlop={8}
            >
              <Text style={styles.signupLink}>Sign up</Text>
            </Pressable>
          </View>

          <Text style={styles.disclaimer}>
            Veyra provides educational information and does not replace
            professional medical advice.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
  flex: 1,
  backgroundColor: COLORS.background,
},
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 32,
  },
  container: {
    flexGrow: 1,
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    justifyContent: "center",
  },

  // Brand
  brand: {
    alignItems: "center",
    marginBottom: 36,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: COLORS.iconBackground,
    borderWidth: 1,
    borderColor: "#326356",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 13,
  },
  brandName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 28,
    letterSpacing: -0.6,
    color: COLORS.text,
  },
  brandSubtitle: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: COLORS.teal,
    marginTop: 5,
  },

  // Heading
  heading: {
    marginBottom: 28,
  },
  eyebrow: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    letterSpacing: 2,
    color: COLORS.teal,
    marginBottom: 12,
  },
  title: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 30,
    letterSpacing: -0.8,
    color: COLORS.text,
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.muted,
  },

  // Form
  form: {
    width: "100%",
  },
  label: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: COLORS.text,
    marginBottom: 10,
  },
  passwordLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    marginTop: 21,
  },
  forgotLink: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    color: COLORS.teal,
    marginBottom: 10,
  },
  inputWrapper: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  input: {
    flex: 1,
    minWidth: 0,
    minHeight: 54,
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: COLORS.text,
    paddingVertical: 12,
  },
  primaryButton: {
    width: "100%",
    minHeight: 56,
    borderRadius: 18,
    backgroundColor: COLORS.teal,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginTop: 28,
    paddingHorizontal: 20,
  },
  primaryButtonText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: COLORS.background,
  },
  pressed: {
    opacity: 0.82,
  },
  disabledButton: {
    opacity: 0.6,
  },

  // Divider
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 28,
    marginBottom: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 9,
    letterSpacing: 1.5,
    color: COLORS.muted,
  },

  // Privacy card
  privacyCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 13,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  privacyIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: COLORS.iconBackground,
    alignItems: "center",
    justifyContent: "center",
  },
  privacyContent: {
    flex: 1,
  },
  privacyTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: COLORS.text,
    marginBottom: 6,
  },
  privacyDescription: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    lineHeight: 19,
    color: COLORS.muted,
  },

  // Footer
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 5,
    marginTop: 28,
  },
  footerText: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: COLORS.muted,
  },
  signupLink: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    color: COLORS.teal,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  disclaimer: {
    fontFamily: "Inter_500Medium",
    fontSize: 10,
    lineHeight: 16,
    color: "#718078",
    textAlign: "center",
    marginTop: 22,
  },
});
