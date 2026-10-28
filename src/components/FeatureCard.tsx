
  import { StyleSheet, View, Text } from "react-native";
  import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

  export default function FeatureCard() {
    return (
      <View style={styles.card}>
        <View style={styles.center}>
          <View style={styles.feature}>
            <View style={styles.iconBox}>
              <Feather name="file-text" size={17} color="#315F4A" />
            </View>
            <Text style={styles.text}>
              Upload any PDF or image of blood or lab report
            </Text>
          </View>

          <View style={styles.feature}>
            <View style={styles.iconBox}>
              <MaterialCommunityIcons
                name="creation"
                size={19}
                color="#315F4A"
              />
            </View>
            <Text style={styles.text}>
              AI explains every biomarker in plain language
            </Text>
          </View>

          <View style={styles.feature}>
            <View style={styles.iconBox}>
              <MaterialCommunityIcons
                name="chat-processing"
                size={18}
                color="#315F4A"
              />
            </View>
            <Text style={styles.text}>
              Ask follow-up questions about your results
            </Text>
          </View>
        </View>
      </View>
    );
  }

  const styles = StyleSheet.create({
    card: {
      width: "300",
      backgroundColor: "#ffffff0e",
      borderRadius: 22,
      paddingVertical: 20,
      paddingHorizontal: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    center: {
      width: "100%",
      alignItems: "center",
      gap: 20,
    },
    feature: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
      width: "100%",
      maxWidth: 300,
    },
    iconBox: {
      width: 34,
      height: 34,
      borderRadius: 10,
      backgroundColor: "#E8F0EB",
      alignItems: "center",
      justifyContent: "center",
    },
    text: {
      flex: 1,
      fontFamily: "Inter_500Medium",
      fontSize: 13,
      lineHeight: 19,
      color: "#e0dcdc",
    },
  });
