
import FeatureCard from "@/components/FeatureCard";
import {
  Inter_500Medium,
  Inter_600SemiBold,
  useFonts,
} from "@expo-google-fonts/inter";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Button from "@/components/Button";

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

export default function Index() {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Inter_500Medium,
    Inter_600SemiBold,
  });

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.background}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* Same icon and colors as the Chat screen */}
          <View style={styles.logo}>
            <Feather
              name="activity"
              size={30}
              color={COLORS.teal}
            />
          </View>

          <View style={styles.heading}>
            <Text style={styles.title}>Veyra</Text>

            <Text style={styles.subtitle}>
              Health, made clearer.
            </Text>

            <Text style={styles.description}>
              Understand your health reports with AI-powered
              insights explained in simple language.
            </Text>
          </View>

          <View style={styles.featureCard}>
            <FeatureCard />
          </View>

          <View style={styles.actions}>
            <Button
              title="Get Started"
              onPress={() => router.push("/login")}
            />

            <Text style={styles.loginHint}>
              Already have an account?{" "}
              <Text
                style={styles.loginLink}
                onPress={() => router.push("/login")}
              >
                Log in
              </Text>
            </Text>
          </View>

          <View style={styles.trustNote}>
            <Feather
              name="shield"
              size={14}
              color={COLORS.muted}
            />
            <Text style={styles.trustText}>
              Your health information deserves care.
            </Text>
          </View>

          <Text style={styles.disclaimer}>
            For informational purposes only. Not a medical diagnosis.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingTop: 35,
    paddingBottom: 28,
  },
  logo: {
    width: 68,
    height: 68,
    borderRadius: 23,
    backgroundColor: "#203A32",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  heading: {
    alignItems: "center",
    width: "100%",
  },
  title: {
    color: COLORS.text,
    fontSize: 42,
    textAlign: "center",
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -1.2,
  },
  subtitle: {
    color: COLORS.teal,
    fontSize: 19,
    marginTop: 5,
    textAlign: "center",
    fontFamily: "Inter_500Medium",
  },
  description: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 18,
    maxWidth: 310,
    textAlign: "center",
    fontFamily: "Inter_500Medium",
  },
  featureCard: {
    width: "100%",
    maxWidth: 340,
    marginTop: 32,
    alignSelf: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  actions: {
    width: "100%",
    maxWidth: 320,
    marginTop: 32,
  },
  loginHint: {
    color: COLORS.muted,
    fontSize: 13,
    textAlign: "center",
    marginTop: 20,
    fontFamily: "Inter_500Medium",
  },
  loginLink: {
    color: COLORS.teal,
    fontFamily: "Inter_600SemiBold",
  },
  trustNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    marginTop: 30,
  },
  trustText: {
    color: COLORS.muted,
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  disclaimer: {
    color: "#718078",
    fontSize: 10,
    textAlign: "center",
    marginTop: 12,
    fontFamily: "Inter_500Medium",
  },
});
