
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
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { resetPassword } from "@/lib/auth";

const COLORS = {
  background: "#111513",
  surface: "#1A211E",
  border: "#2B3732",
  text: "#F3F7F4",
  muted: "#9AA8A0",
  teal: "#35BDB3",
  iconBackground: "#203A32",
};

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleResetPassword() {
    if (!email.trim()) {
      Alert.alert("Email required", "Please enter your email address.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      Alert.alert("Invalid email", "Please enter a valid email address.");
      return;
    }

    Keyboard.dismiss();
    setLoading(true);

    try {
      await resetPassword(email.trim());

      Alert.alert(
        "Check your email",
        "If an account exists for that email address, a password reset link will be sent. Check your inbox and spam folder.",
        [
          {
            text: "Back to sign in",
            onPress: () => router.replace("/login"),
          },
        ]
      );
    } catch (error: any) {
      let message = "Unable to process your request. Please try again.";

      if (error?.code === "auth/invalid-email") {
        message = "Please enter a valid email address.";
      } else if (error?.code === "auth/too-many-requests") {
        message = "Too many attempts. Please try again later.";
      } else if (error?.code === "app/firebase-not-configured") {
        message =
          "Firebase is not configured. Check your environment variables.";
      }

      Alert.alert("Password reset", message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "bottom"]}
    >
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={
            Platform.OS === "ios" ? "interactive" : "on-drag"
          }
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            {/* Back button */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Back to sign in"
              onPress={() => router.replace("/login")}
              disabled={loading}
              style={styles.backButton}
            >
              <Feather
                name="arrow-left"
                size={20}
                color={COLORS.text}
              />
            </Pressable>

            {/* Brand and heading */}
            <View style={styles.heading}>
              <View style={styles.logo}>
                <Feather
                  name="activity"
                  size={28}
                  color={COLORS.teal}
                />
              </View>

              <Text style={styles.brandName}>Veyra</Text>
              <Text style={styles.brandSubtitle}>
                Health, made clearer.
              </Text>

              <View style={styles.headingText}>
                <Text style={styles.eyebrow}>ACCOUNT RECOVERY</Text>
                <Text style={styles.title}>Forgot password?</Text>
                <Text style={styles.subtitle}>
                  No worries. Enter the email address associated with
                  your account and we'll help you reset your password.
                </Text>
              </View>
            </View>

            {/* Reset form */}
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
                  returnKeyType="done"
                  onSubmitEditing={handleResetPassword}
                  editable={!loading}
                  accessibilityLabel="Email address"
                />
              </View>

              <Pressable
                onPress={handleResetPassword}
                disabled={loading}
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && !loading && styles.pressed,
                  loading && styles.disabledButton,
                ]}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.background} />
                ) : (
                  <>
                    <Text style={styles.primaryButtonText}>
                      Send reset link
                    </Text>
                    <Feather
                      name="arrow-right"
                      size={19}
                      color={COLORS.background}
                    />
                  </>
                )}
              </Pressable>
            </View>

            {/* Back to login */}
            <Pressable
              onPress={() => router.replace("/login")}
              disabled={loading}
              style={styles.footer}
              accessibilityRole="button"
            >
              <Feather
                name="arrow-left"
                size={16}
                color={COLORS.teal}
              />
              <Text style={styles.link}>Back to sign in</Text>
            </Pressable>

            {/* Security note */}
            <View style={styles.securityNote}>
              <Feather
                name="shield"
                size={14}
                color={COLORS.muted}
              />
              <Text style={styles.securityText}>
                Your account security matters.
              </Text>
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
    paddingTop: 16,
    paddingBottom: 30,
  },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
  },

  // Back button
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 26,
  },

  // Branding
  heading: {
    alignItems: "center",
    marginBottom: 34,
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
    marginBottom: 12,
  },
  brandName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 27,
    letterSpacing: -0.6,
    color: COLORS.text,
  },
  brandSubtitle: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: COLORS.teal,
    marginTop: 4,
  },
  headingText: {
    alignItems: "center",
    marginTop: 30,
  },
  eyebrow: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    letterSpacing: 1.8,
    color: COLORS.teal,
    marginBottom: 11,
  },
  title: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 28,
    letterSpacing: -0.6,
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    lineHeight: 23,
    color: COLORS.muted,
    textAlign: "center",
    maxWidth: 310,
  },

  // Form
  form: {
    width: "100%",
  },
  label: {
    fontFamily: "Inter_600SemiBold",
    color: COLORS.text,
    fontSize: 13,
    marginBottom: 10,
  },
  inputWrapper: {
    minHeight: 56,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 15,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
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
    marginTop: 25,
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

  // Footer
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 30,
    paddingVertical: 10,
  },
  link: {
    fontFamily: "Inter_600SemiBold",
    color: COLORS.teal,
    fontSize: 13,
  },
  securityNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    marginTop: 24,
  },
  securityText: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    color: COLORS.muted,
  },
  disclaimer: {
    fontFamily: "Inter_500Medium",
    fontSize: 10,
    lineHeight: 16,
    color: "#718078",
    textAlign: "center",
    marginTop: 14,
  },
});
