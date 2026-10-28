
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
import { signup } from "@/lib/auth";
import { SafeAreaView } from "react-native-safe-area-context";

const COLORS = {
  background: "#111513",
  surface: "#1A211E",
  border: "#2B3732",
  text: "#F3F7F4",
  muted: "#9AA8A0",
  teal: "#35BDB3",
  iconBackground: "#203A32",
};

export default function SignupScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      Alert.alert("Missing information", "Please complete all fields.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      Alert.alert("Invalid email", "Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      Alert.alert(
        "Password too short",
        "Your password must be at least 8 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        "Passwords don't match",
        "Please make sure both passwords match."
      );
      return;
    }

    Keyboard.dismiss();
    setLoading(true);

    try {
      await signup(name.trim(), email.trim(), password);

      Alert.alert(
        "Account created",
        "Your account has been created successfully.",
        [
          {
            text: "Continue",
            onPress: () => router.replace("/"),
          },
        ]
      );
    } catch (error: any) {
      const code = error?.code;
      let message = "Unable to create your account. Please try again.";

      if (code === "auth/email-already-in-use") {
        message =
          "An account already exists with this email. Try signing in instead.";
      } else if (code === "auth/invalid-email") {
        message = "Please enter a valid email address.";
      } else if (code === "auth/weak-password") {
        message = "Please choose a stronger password.";
      } else if (code === "app/firebase-not-configured") {
        message =
          "Firebase is not configured. Check your environment variables.";
      }

      Alert.alert("Sign up failed", message);
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
          {/* Back button */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() =>
              router.canGoBack() ? router.back() : router.replace("/login")
            }
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

            <View style={styles.headingText}>
              <Text style={styles.title}>Create your account</Text>
              <Text style={styles.subtitle}>
                Your journey to clearer health insights starts here.
              </Text>
            </View>
          </View>

          {/* Signup form */}
          <View style={styles.form}>
            <Text style={styles.label}>Full name</Text>

            <View style={styles.inputWrapper}>
              <Feather name="user" size={18} color={COLORS.muted} />
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor="#718078"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoComplete="name"
                textContentType="name"
                returnKeyType="next"
                editable={!loading}
                accessibilityLabel="Full name"
              />
            </View>

            <Text style={styles.labelSpaced}>Email address</Text>

            <View style={styles.inputWrapper}>
              <Feather name="mail" size={18} color={COLORS.muted} />
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

            <Text style={styles.labelSpaced}>Password</Text>

            <View style={styles.inputWrapper}>
              <Feather name="lock" size={18} color={COLORS.muted} />
              <TextInput
                style={styles.input}
                placeholder="At least 8 characters"
                placeholderTextColor="#718078"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!passwordVisible}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="new-password"
                textContentType="newPassword"
                returnKeyType="next"
                editable={!loading}
                accessibilityLabel="Password"
              />

              <Pressable
                onPress={() => setPasswordVisible((previous) => !previous)}
                accessibilityRole="button"
                accessibilityLabel={
                  passwordVisible ? "Hide password" : "Show password"
                }
                hitSlop={8}
              >
                <Feather
                  name={passwordVisible ? "eye-off" : "eye"}
                  size={18}
                  color={COLORS.muted}
                />
              </Pressable>
            </View>

            <Text style={styles.labelSpaced}>Confirm password</Text>

            <View style={styles.inputWrapper}>
              <Feather name="shield" size={18} color={COLORS.muted} />
              <TextInput
                style={styles.input}
                placeholder="Re-enter your password"
                placeholderTextColor="#718078"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!confirmVisible}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="new-password"
                textContentType="newPassword"
                returnKeyType="done"
                onSubmitEditing={handleSignup}
                editable={!loading}
                accessibilityLabel="Confirm password"
              />

              <Pressable
                onPress={() => setConfirmVisible((previous) => !previous)}
                accessibilityRole="button"
                accessibilityLabel={
                  confirmVisible ? "Hide password" : "Show password"
                }
                hitSlop={8}
              >
                <Feather
                  name={confirmVisible ? "eye-off" : "eye"}
                  size={18}
                  color={COLORS.muted}
                />
              </Pressable>
            </View>

            <Pressable
              onPress={handleSignup}
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
                    Create account
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

          {/* Sign-in footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Already have an account?
            </Text>

            <Pressable
              onPress={() => router.push("/login")}
              disabled={loading}
              accessibilityRole="button"
              hitSlop={8}
            >
              <Text style={styles.link}>Sign in</Text>
            </Pressable>
          </View>

          <View style={styles.securityNote}>
            <Feather
              name="shield"
              size={14}
              color={COLORS.muted}
            />
            <Text style={styles.securityText}>
              Your health information deserves care.
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
    paddingTop: 18,
    paddingBottom: 32,
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
    marginBottom: 10,
  },

  // Brand
  heading: {
    alignItems: "center",
    marginBottom: 28,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: "#203A32",
    borderWidth: 1,
    borderColor: "#326356",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
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
    marginTop: 27,
  },
  eyebrow: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    letterSpacing: 1.8,
    color: COLORS.teal,
    marginBottom: 1,
  },
  title: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 27,
    letterSpacing: -0.6,
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 2,
  },
  subtitle: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    lineHeight: 21,
    color: COLORS.muted,
    textAlign: "center",
    maxWidth: 300,
  },

  // Form
  form: {
    width: "100%",
  },
  label: {
    fontFamily: "Inter_600SemiBold",
    color: COLORS.text,
    fontSize: 13,
    marginBottom: 9,
  },
  labelSpaced: {
    fontFamily: "Inter_600SemiBold",
    color: COLORS.text,
    fontSize: 13,
    marginTop: 17,
    marginBottom: 9,
  },
  inputWrapper: {
    minHeight: 55,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 15,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: COLORS.surface,
  },
  input: {
    flex: 1,
    minWidth: 0,
    minHeight: 53,
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: COLORS.text,
    paddingVertical: 11,
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
    marginTop: 26,
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
    flexWrap: "wrap",
    gap: 5,
    marginTop: 25,
    paddingVertical: 5,
  },
  footerText: {
    fontFamily: "Inter_500Medium",
    color: COLORS.muted,
    fontSize: 12,
  },
  link: {
    fontFamily: "Inter_600SemiBold",
    color: COLORS.teal,
    fontSize: 12,
    paddingVertical: 4,
  },
  securityNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    marginTop: 18,
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
