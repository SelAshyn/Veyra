
import React from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const C = {
  bg: "#111513",
  card: "#1A211E",
  card2: "#202A25",
  border: "#2B3732",
  text: "#F3F7F4",
  muted: "#9AA8A0",
  teal: "#35BDB3",
  green: "#315F4A",
  yellow: "#E8B75A",
  red: "#F07878",
};

type MarkerStatus = "Low" | "Normal" | "High" | "Pending";

function StatusPill({ status }: { status: MarkerStatus }) {
  const color =
    status === "High"
      ? C.red
      : status === "Low"
        ? C.yellow
        : status === "Normal"
          ? C.teal
          : C.muted;

  return (
    <View
      style={[
        styles.statusPill,
        { borderColor: `${color}66`, backgroundColor: `${color}18` },
      ]}
    >
      <View style={[styles.statusDot, { backgroundColor: color }]} />
      <Text style={[styles.statusText, { color }]}>{status}</Text>
    </View>
  );
}

function EmptyChart() {
  return (
    <View style={styles.chart}>
      <View style={styles.chartYAxis}>
        <Text style={styles.axisLabel}>High</Text>
        <Text style={styles.axisLabel}>Normal</Text>
        <Text style={styles.axisLabel}>Low</Text>
      </View>

      <View style={styles.chartPlot}>
        {[0, 1, 2, 3].map((line) => (
          <View key={line} style={styles.chartGridLine} />
        ))}

        <View style={styles.chartEmpty}>
          <View style={styles.chartIcon}>
            <Feather name="trending-up" size={22} color={C.teal} />
          </View>
          <Text style={styles.chartEmptyTitle}>No measurements yet</Text>
          <Text style={styles.chartEmptyText}>
            Upload a report to plot your actual blood-sugar readings.
          </Text>
        </View>

        <View style={styles.chartXAxis}>
          <Text style={styles.axisLabel}>Earlier</Text>
          <Text style={styles.axisLabel}>Latest</Text>
        </View>
      </View>
    </View>
  );
}

function BiomarkerRow({
  name,
  description,
}: {
  name: string;
  description: string;
}) {
  return (
    <View style={styles.markerRow}>
      <View style={styles.markerIcon}>
        <Feather name="activity" size={17} color={C.teal} />
      </View>

      <View style={styles.markerInfo}>
        <Text style={styles.markerName}>{name}</Text>
        <Text style={styles.markerDescription}>{description}</Text>
      </View>

      <StatusPill status="Pending" />
    </View>
  );
}

export default function AnalysisScreen() {
  // Connect this screen to extracted report data when your analysis backend
  // is ready. Never replace these empty states with invented patient results.
  const hasAnalysis = false;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>YOUR HEALTH, EXPLAINED</Text>
            <Text style={styles.title}>Health Analysis</Text>
            <Text style={styles.subtitle}>
              Understand your report, one measurement at a time.
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Feather name="bar-chart-2" size={21} color={C.teal} />
          </View>
        </View>

        {!hasAnalysis ? (
          <View style={styles.emptyReportCard}>
            <View style={styles.emptyReportIcon}>
              <Feather name="file-text" size={27} color={C.teal} />
            </View>

            <Text style={styles.emptyReportTitle}>
              Your report analysis will appear here
            </Text>

            <Text style={styles.emptyReportText}>
              Upload a blood test or health report in Chat. Once the report is
              analysed, this page can show its measurements, reference ranges,
              out-of-range values, charts, and a simple explanation.
            </Text>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.replace("/(tabs)")}
            >
              <Feather name="paperclip" size={17} color={C.bg} />
              <Text style={styles.primaryButtonText}>Upload a report in Chat</Text>
            </TouchableOpacity>

            <Text style={styles.privacyHint}>
              Your personal results will only appear here when real report data
              is available.
            </Text>
          </View>
        ) : null}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Report overview</Text>
            <Text style={styles.sectionSubtitle}>
              Summary from your latest uploaded report
            </Text>
          </View>
          <Feather name="file-text" size={19} color={C.muted} />
        </View>

        <View style={styles.overviewGrid}>
          <View style={styles.overviewCard}>
            <Text style={styles.overviewLabel}>Measurements</Text>
            <Text style={styles.overviewValue}>—</Text>
            <Text style={styles.overviewHint}>Extracted from report</Text>
          </View>

          <View style={styles.overviewCard}>
            <Text style={styles.overviewLabel}>Out of range</Text>
            <Text style={styles.overviewValue}>—</Text>
            <Text style={styles.overviewHint}>Requires real results</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Blood sugar</Text>
            <Text style={styles.sectionSubtitle}>
              Glucose measurements from your report
            </Text>
          </View>
          <View style={styles.smallIcon}>
            <Feather name="activity" size={16} color={C.teal} />
          </View>
        </View>

        <View style={styles.panel}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={styles.panelTitle}>Glucose trend</Text>
              <Text style={styles.panelSubtitle}>
                Actual readings will be plotted here
              </Text>
            </View>
            <StatusPill status="Pending" />
          </View>

          <EmptyChart />

          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: C.teal }]} />
              <Text style={styles.legendText}>Measured glucose</Text>
            </View>
            <Text style={styles.legendText}>No data available</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Biomarker breakdown</Text>
            <Text style={styles.sectionSubtitle}>
              Individual measurements and their status
            </Text>
          </View>
        </View>

        <View style={styles.panel}>
          <BiomarkerRow
            name="Blood glucose"
            description="Blood sugar measurement"
          />
          <View style={styles.separator} />
          <BiomarkerRow
            name="Cholesterol"
            description="Blood lipid measurement"
          />
          <View style={styles.separator} />
          <BiomarkerRow
            name="Haemoglobin"
            description="Oxygen-carrying protein in blood"
          />
          <View style={styles.separator} />
          <BiomarkerRow
            name="Vitamin levels"
            description="Shown when included in your report"
          />
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>In simple terms</Text>
            <Text style={styles.sectionSubtitle}>
              A plain-language explanation of your results
            </Text>
          </View>
          <Feather name="book-open" size={19} color={C.muted} />
        </View>

        <View style={styles.explanationCard}>
          <View style={styles.explanationHeading}>
            <Feather name="message-circle" size={19} color={C.teal} />
            <Text style={styles.explanationTitle}>Report explained</Text>
          </View>

          <Text style={styles.explanationText}>
            Once your report is processed, this section will explain what each
            measurement means, compare it with the reference range printed on
            the report, and highlight which results may need follow-up.
          </Text>

          <Text style={styles.explanationFootnote}>
            Reference ranges can vary by laboratory and individual circumstances.
            A high or low result does not, by itself, confirm a diagnosis.
          </Text>
        </View>

        <View style={styles.disclaimer}>
          <Feather name="shield" size={16} color={C.muted} />
          <Text style={styles.disclaimerText}>
            This dashboard is for informational purposes only. Discuss
            concerning results with a qualified healthcare professional.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bg },
  content: { padding: 18, paddingBottom: 30 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 23,
  },
  eyebrow: {
    color: C.teal,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 7,
  },
  title: { color: C.text, fontSize: 27, fontWeight: "800" },
  subtitle: {
    color: C.muted,
    fontSize: 12,
    lineHeight: 19,
    marginTop: 6,
    maxWidth: 270,
  },
  headerIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: C.card2,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyReportCard: {
    backgroundColor: C.card,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: C.border,
    padding: 20,
    alignItems: "flex-start",
    marginBottom: 27,
  },
  emptyReportIcon: {
    width: 51,
    height: 51,
    borderRadius: 16,
    backgroundColor: "#203A32",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  emptyReportTitle: {
    color: C.text,
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 25,
  },
  emptyReportText: {
    color: C.muted,
    fontSize: 12,
    lineHeight: 20,
    marginTop: 9,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    backgroundColor: C.teal,
    borderRadius: 13,
    paddingHorizontal: 15,
    paddingVertical: 13,
    marginTop: 18,
    alignSelf: "stretch",
  },
  primaryButtonText: {
    color: C.bg,
    fontSize: 12,
    fontWeight: "800",
  },
  privacyHint: {
    color: C.muted,
    fontSize: 10,
    lineHeight: 16,
    marginTop: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 13,
    marginTop: 3,
  },
  sectionTitle: { color: C.text, fontSize: 17, fontWeight: "700" },
  sectionSubtitle: { color: C.muted, fontSize: 11, marginTop: 5 },
  overviewGrid: { flexDirection: "row", gap: 11, marginBottom: 26 },
  overviewCard: {
    flex: 1,
    backgroundColor: C.card,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: C.border,
    padding: 15,
  },
  overviewLabel: { color: C.muted, fontSize: 11 },
  overviewValue: {
    color: C.text,
    fontSize: 27,
    fontWeight: "800",
    marginTop: 9,
  },
  overviewHint: { color: C.muted, fontSize: 10, marginTop: 5 },
  smallIcon: {
    width: 33,
    height: 33,
    borderRadius: 11,
    backgroundColor: C.card2,
    alignItems: "center",
    justifyContent: "center",
  },
  panel: {
    backgroundColor: C.card,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: C.border,
    padding: 15,
    marginBottom: 26,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  panelTitle: { color: C.text, fontSize: 14, fontWeight: "700" },
  panelSubtitle: { color: C.muted, fontSize: 10, marginTop: 5 },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 10, fontWeight: "700" },
  chart: { height: 185, flexDirection: "row", marginTop: 18 },
  chartYAxis: {
    width: 42,
    justifyContent: "space-between",
    paddingBottom: 23,
    paddingTop: 2,
  },
  axisLabel: { color: C.muted, fontSize: 9 },
  chartPlot: { flex: 1, justifyContent: "space-between" },
  chartGridLine: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 5,
    borderTopWidth: 1,
    borderColor: C.border,
    borderStyle: "dashed",
  },
  chartEmpty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  chartIcon: {
    width: 39,
    height: 39,
    borderRadius: 13,
    backgroundColor: "#203A32",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  chartEmptyTitle: { color: C.text, fontSize: 12, fontWeight: "700" },
  chartEmptyText: {
    color: C.muted,
    fontSize: 10,
    lineHeight: 15,
    textAlign: "center",
    marginTop: 5,
    maxWidth: 220,
  },
  chartXAxis: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderColor: C.border,
    paddingTop: 7,
  },
  chartLegend: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 7,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 7 },
  legendDot: { width: 7, height: 7, borderRadius: 4 },
  legendText: { color: C.muted, fontSize: 10 },
  markerRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 13 },
  markerIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#203A32",
    alignItems: "center",
    justifyContent: "center",
  },
  markerInfo: { flex: 1 },
  markerName: { color: C.text, fontSize: 12, fontWeight: "700" },
  markerDescription: { color: C.muted, fontSize: 10, marginTop: 4 },
  separator: { height: 1, backgroundColor: C.border },
  explanationCard: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
  },
  explanationHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginBottom: 10,
  },
  explanationTitle: { color: C.text, fontSize: 13, fontWeight: "700" },
  explanationText: { color: C.muted, fontSize: 12, lineHeight: 20 },
  explanationFootnote: {
    color: C.muted,
    fontSize: 10,
    lineHeight: 16,
    marginTop: 12,
    borderTopWidth: 1,
    borderColor: C.border,
    paddingTop: 11,
  },
  disclaimer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingHorizontal: 2,
  },
  disclaimerText: { flex: 1, color: C.muted, fontSize: 10, lineHeight: 16 },
});
