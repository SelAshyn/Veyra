import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  deleteAnalysis,
  listAnalyses,
  Marker,
  MarkerStatus,
  ReportAnalysis,
} from "@/lib/analysis";

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

const STATUS_COLOR: Record<MarkerStatus, string> = {
  High: C.red,
  Low: C.yellow,
  Normal: C.teal,
};

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function countStatuses(markers: Marker[]) {
  return {
    high: markers.filter((m) => m.status === "High").length,
    low: markers.filter((m) => m.status === "Low").length,
    normal: markers.filter((m) => m.status === "Normal").length,
  };
}

/* ---------- trends across reports ---------- */

type TrendPoint = { value: number; status: MarkerStatus };
type Trend = { name: string; unit: string; points: TrendPoint[] };

function buildTrends(reports: ReportAnalysis[]): Trend[] {
  const map = new Map<string, Trend>();

  [...reports]
    .sort((a, b) => a.createdAt - b.createdAt)
    .forEach((report) => {
      report.markers.forEach((marker) => {
        if (marker.numericValue === null) return;

        const key = marker.name.toLowerCase().replace(/[^a-z0-9]/g, "");
        if (!key) return;

        const trend = map.get(key) ?? {
          name: marker.name,
          unit: marker.unit,
          points: [],
        };

        trend.points.push({
          value: marker.numericValue,
          status: marker.status,
        });
        map.set(key, trend);
      });
    });

  return [...map.values()]
    .filter((trend) => trend.points.length >= 2)
    .sort((a, b) => {
      const aBad = a.points[a.points.length - 1].status !== "Normal" ? 1 : 0;
      const bBad = b.points[b.points.length - 1].status !== "Normal" ? 1 : 0;
      return bBad - aBad;
    })
    .slice(0, 6);
}

function TrendRow({ trend }: { trend: Trend }) {
  const points = trend.points.slice(-8);
  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);

  const first = points[0].value;
  const last = points[points.length - 1];
  const change = last.value - first;
  const arrow = change === 0 ? "minus" : change > 0 ? "arrow-up-right" : "arrow-down-right";

  return (
    <View style={styles.trendRow}>
      <View style={styles.trendInfo}>
        <Text style={styles.markerName}>{trend.name}</Text>
        <View style={styles.trendValueRow}>
          <Text style={[styles.trendValue, { color: STATUS_COLOR[last.status] }]}>
            {last.value}
          </Text>
          {trend.unit ? <Text style={styles.markerUnit}>{trend.unit}</Text> : null}
          <Feather name={arrow} size={13} color={C.muted} />
        </View>
      </View>

      <View style={styles.trendBars}>
        {points.map((point, index) => {
          const height = max === min ? 24 : 10 + ((point.value - min) / (max - min)) * 30;
          return (
            <View
              key={index}
              style={[
                styles.trendBar,
                { height, backgroundColor: STATUS_COLOR[point.status] },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

/* ---------- small pieces ---------- */

function StatusPill({ status }: { status: MarkerStatus }) {
  const color = STATUS_COLOR[status];

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

function CountCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number | string;
  color?: string;
}) {
  return (
    <View style={styles.overviewCard}>
      <Text style={styles.overviewLabel}>{label}</Text>
      <Text style={[styles.overviewValue, color ? { color } : null]}>{value}</Text>
    </View>
  );
}

function MarkerCard({ marker }: { marker: Marker }) {
  const color = STATUS_COLOR[marker.status];

  return (
    <View style={[styles.markerCard, { borderColor: `${color}55` }]}>
      <View style={styles.markerTop}>
        <View style={styles.markerTitleBlock}>
          <Text style={styles.markerName}>{marker.name}</Text>
          <Text style={styles.markerRange}>
            {marker.rangeText ? `Normal: ${marker.rangeText}` : "No range in report"}
          </Text>
        </View>

        <View style={styles.markerValueBox}>
          <Text style={[styles.markerValue, { color }]}>{marker.value}</Text>
          {marker.unit ? <Text style={styles.markerUnit}>{marker.unit}</Text> : null}
        </View>
      </View>

      <StatusPill status={marker.status} />

      {marker.meaning ? (
        <View style={styles.detailBlock}>
          <Text style={styles.detailLabel}>What it means</Text>
          <Text style={styles.detailText}>{marker.meaning}</Text>
        </View>
      ) : null}

      {marker.howToImprove ? (
        <View style={styles.detailBlock}>
          <Text style={styles.detailLabel}>
            {marker.status === "High" ? "How to bring it down" : "How to raise it"}
          </Text>
          <Text style={styles.detailText}>{marker.howToImprove}</Text>
        </View>
      ) : null}
    </View>
  );
}

function ReportCard({
  report,
  onPress,
}: {
  report: ReportAnalysis;
  onPress: () => void;
}) {
  const counts = countStatuses(report.markers);

  return (
    <TouchableOpacity style={styles.reportCard} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.reportIcon}>
        <Feather name="file-text" size={18} color={C.teal} />
      </View>

      <View style={styles.reportInfo}>
        <Text style={styles.reportTitle} numberOfLines={1}>
          {report.reportType}
        </Text>
        <Text style={styles.reportMeta} numberOfLines={1}>
          {report.fileName} · {formatDate(report.createdAt)}
        </Text>

        <View style={styles.reportCounts}>
          {counts.high > 0 && (
            <Text style={[styles.reportCount, { color: C.red }]}>{counts.high} high</Text>
          )}
          {counts.low > 0 && (
            <Text style={[styles.reportCount, { color: C.yellow }]}>{counts.low} low</Text>
          )}
          <Text style={[styles.reportCount, { color: C.teal }]}>{counts.normal} normal</Text>
        </View>
      </View>

      <Feather name="chevron-right" size={17} color={C.muted} />
    </TouchableOpacity>
  );
}

/* ---------- screen ---------- */

export default function AnalysisScreen() {
  const [reports, setReports] = useState<ReportAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Reload every time the tab is opened, so a report analysed in Chat shows up
  useFocusEffect(
    useCallback(() => {
      let active = true;

      listAnalyses().then((list) => {
        if (!active) return;
        setReports(list);
        setLoading(false);
      });

      return () => {
        active = false;
      };
    }, [])
  );

  const selected = reports.find((report) => report.id === selectedId) ?? null;
  const trends = useMemo(() => buildTrends(reports), [reports]);

  function confirmDelete(report: ReportAnalysis) {
    Alert.alert(
      "Delete this analysis?",
      "It will be removed from this phone. Your chat history is not affected.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteAnalysis(report.id);
            setReports((current) => current.filter((item) => item.id !== report.id));
            setSelectedId(null);
          },
        },
      ]
    );
  }

  /* ----- detail view ----- */
  if (selected) {
    const high = selected.markers.filter((m) => m.status === "High");
    const low = selected.markers.filter((m) => m.status === "Low");
    const normal = selected.markers.filter((m) => m.status === "Normal");

    return (
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <StatusBar barStyle="light-content" backgroundColor={C.bg} />

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={styles.backRow} onPress={() => setSelectedId(null)}>
            <Feather name="chevron-left" size={19} color={C.teal} />
            <Text style={styles.backText}>All reports</Text>
          </TouchableOpacity>

          <Text style={styles.title}>{selected.reportType}</Text>
          <Text style={styles.subtitle}>
            {selected.fileName} · {formatDate(selected.createdAt)}
          </Text>

          <View style={styles.overviewGrid}>
            <CountCard label="High" value={high.length} color={C.red} />
            <CountCard label="Low" value={low.length} color={C.yellow} />
            <CountCard label="Normal" value={normal.length} color={C.teal} />
          </View>

          {selected.summary ? (
            <View style={styles.explanationCard}>
              <View style={styles.explanationHeading}>
                <Feather name="message-circle" size={18} color={C.teal} />
                <Text style={styles.explanationTitle}>In simple terms</Text>
              </View>
              <Text style={styles.explanationText}>{selected.summary}</Text>
            </View>
          ) : null}

          {high.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Above normal</Text>
              {high.map((marker, i) => (
                <MarkerCard key={`h-${i}`} marker={marker} />
              ))}
            </>
          )}

          {low.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Below normal</Text>
              {low.map((marker, i) => (
                <MarkerCard key={`l-${i}`} marker={marker} />
              ))}
            </>
          )}

          {normal.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Within normal range</Text>
              <View style={styles.panel}>
                {normal.map((marker, i) => (
                  <View key={`n-${i}`}>
                    {i > 0 && <View style={styles.separator} />}
                    <View style={styles.normalRow}>
                      <Text style={styles.normalName}>{marker.name}</Text>
                      <Text style={styles.normalValue}>
                        {marker.value} {marker.unit}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}

          {selected.nextSteps.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Next steps</Text>
              <View style={styles.panel}>
                {selected.nextSteps.map((step, i) => (
                  <View key={i} style={styles.stepRow}>
                    <Feather name="check-circle" size={15} color={C.teal} />
                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          <TouchableOpacity style={styles.deleteButton} onPress={() => confirmDelete(selected)}>
            <Feather name="trash-2" size={16} color={C.red} />
            <Text style={styles.deleteText}>Delete this analysis</Text>
          </TouchableOpacity>

          <View style={styles.disclaimer}>
            <Feather name="shield" size={16} color={C.muted} />
            <Text style={styles.disclaimerText}>
              For information only. A high or low result does not confirm a diagnosis, and
              reference ranges vary between labs. Discuss concerning results with a doctor.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  /* ----- list view ----- */
  const latestCounts = reports.length > 0 ? countStatuses(reports[0].markers) : null;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Health Analysis</Text>
            <Text style={styles.subtitle}>
              Every report you upload in Chat is explained and saved here.
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Feather name="bar-chart-2" size={21} color={C.teal} />
          </View>
        </View>

        {loading ? (
          <ActivityIndicator color={C.teal} style={{ marginTop: 40 }} />
        ) : reports.length === 0 ? (
          <View style={styles.emptyReportCard}>
            <View style={styles.emptyReportIcon}>
              <Feather name="file-text" size={27} color={C.teal} />
            </View>

            <Text style={styles.emptyReportTitle}>No reports analysed yet</Text>

            <Text style={styles.emptyReportText}>
              Attach a blood test or health report in Chat. Once it has been read, you will see
              which results are high, low or normal, what they mean, and how to improve them.
            </Text>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.navigate("/(tabs)")}
            >
              <Feather name="paperclip" size={17} color={C.bg} />
              <Text style={styles.primaryButtonText}>Upload a report in Chat</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.overviewGrid}>
              <CountCard label="Reports saved" value={reports.length} />
              <CountCard
                label="Need attention (latest)"
                value={latestCounts ? latestCounts.high + latestCounts.low : 0}
                color={
                  latestCounts && latestCounts.high + latestCounts.low > 0 ? C.red : C.teal
                }
              />
            </View>

            {trends.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Changes over time</Text>
                <View style={styles.panel}>
                  {trends.map((trend, i) => (
                    <View key={trend.name}>
                      {i > 0 && <View style={styles.separator} />}
                      <TrendRow trend={trend} />
                    </View>
                  ))}
                </View>
              </>
            )}

            <Text style={styles.sectionTitle}>Your reports</Text>
            {reports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onPress={() => setSelectedId(report.id)}
              />
            ))}
          </>
        )}

        <View style={styles.disclaimer}>
          <Feather name="shield" size={16} color={C.muted} />
          <Text style={styles.disclaimerText}>
            Saved on this phone and linked to your account only. For information only; it is not
            a diagnosis.
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
    marginBottom: 22,
  },
  title: { color: C.text, fontSize: 27, fontWeight: "800" },
  subtitle: {
    color: C.muted,
    fontSize: 12,
    lineHeight: 19,
    marginTop: 6,
    maxWidth: 280,
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
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 14,
    alignSelf: "flex-start",
  },
  backText: { color: C.teal, fontSize: 13, fontWeight: "700" },
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
  emptyReportTitle: { color: C.text, fontSize: 18, fontWeight: "700", lineHeight: 25 },
  emptyReportText: { color: C.muted, fontSize: 12, lineHeight: 20, marginTop: 9 },
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
  primaryButtonText: { color: C.bg, fontSize: 12, fontWeight: "800" },
  sectionTitle: {
    color: C.text,
    fontSize: 16,
    fontWeight: "700",
    marginTop: 8,
    marginBottom: 12,
  },
  overviewGrid: { flexDirection: "row", gap: 11, marginTop: 4, marginBottom: 22 },
  overviewCard: {
    flex: 1,
    backgroundColor: C.card,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: C.border,
    padding: 15,
  },
  overviewLabel: { color: C.muted, fontSize: 11 },
  overviewValue: { color: C.text, fontSize: 27, fontWeight: "800", marginTop: 9 },
  panel: {
    backgroundColor: C.card,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 15,
    paddingVertical: 6,
    marginBottom: 24,
  },
  separator: { height: 1, backgroundColor: C.border },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 10,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 10, fontWeight: "700" },
  markerCard: {
    backgroundColor: C.card,
    borderRadius: 18,
    borderWidth: 1,
    padding: 15,
    marginBottom: 12,
  },
  markerTop: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
  markerTitleBlock: { flex: 1 },
  markerName: { color: C.text, fontSize: 14, fontWeight: "700" },
  markerRange: { color: C.muted, fontSize: 11, marginTop: 4 },
  markerValueBox: { alignItems: "flex-end" },
  markerValue: { fontSize: 20, fontWeight: "800" },
  markerUnit: { color: C.muted, fontSize: 10, marginTop: 2 },
  detailBlock: {
    marginTop: 13,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: C.border,
  },
  detailLabel: { color: C.teal, fontSize: 11, fontWeight: "700", marginBottom: 5 },
  detailText: { color: C.text, fontSize: 13, lineHeight: 20 },
  normalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    gap: 10,
  },
  normalName: { color: C.text, fontSize: 12, flex: 1 },
  normalValue: { color: C.muted, fontSize: 12 },
  stepRow: { flexDirection: "row", gap: 10, paddingVertical: 10, alignItems: "flex-start" },
  stepText: { color: C.text, fontSize: 13, lineHeight: 20, flex: 1 },
  reportCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: C.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    marginBottom: 11,
  },
  reportIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: "#203A32",
    alignItems: "center",
    justifyContent: "center",
  },
  reportInfo: { flex: 1 },
  reportTitle: { color: C.text, fontSize: 13, fontWeight: "700" },
  reportMeta: { color: C.muted, fontSize: 10, marginTop: 4 },
  reportCounts: { flexDirection: "row", gap: 10, marginTop: 8 },
  reportCount: { fontSize: 10, fontWeight: "700" },
  trendRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 13,
    gap: 12,
  },
  trendInfo: { flex: 1 },
  trendValueRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 5 },
  trendValue: { fontSize: 16, fontWeight: "800" },
  trendBars: { flexDirection: "row", alignItems: "flex-end", gap: 4, height: 42 },
  trendBar: { width: 8, borderRadius: 3 },
  explanationCard: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 18,
    padding: 16,
    marginBottom: 22,
  },
  explanationHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginBottom: 10,
  },
  explanationTitle: { color: C.text, fontSize: 13, fontWeight: "700" },
  explanationText: { color: C.text, fontSize: 13, lineHeight: 21 },
  deleteButton: {
    minHeight: 47,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: "#623A3A",
    borderRadius: 14,
    marginBottom: 22,
  },
  deleteText: { color: C.red, fontSize: 12, fontWeight: "700" },
  disclaimer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingHorizontal: 2,
    marginTop: 4,
  },
  disclaimerText: { flex: 1, color: C.muted, fontSize: 10, lineHeight: 16 },
});
