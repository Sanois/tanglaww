import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");
// Detect standard tablet breakpoints safely
const isTablet = width >= 600;

const PERFORMANCE_DATA = {
  overallProgress: 0.35,
  averageScore: 85,
  completedCourses: 2,
  totalCourses: 6,
  weeklyFrequency: 4,
  courses: [
    {
      id: "1",
      name: "LET On Boarding",
      progress: 0.92,
      status: "Excellent",
      color: "#4CD964",
      scores: [25, 50, 100],
      weakTopics: [
        { topic: "Ethics", rate: 21 },
        { topic: "Understanding...", rate: 45 },
      ],
    },
    {
      id: "2",
      name: "LET Express",
      progress: 0.58,
      status: "Average",
      color: "#FFB800",
      scores: [40, 75, 60],
      weakTopics: [{ topic: "History", rate: 53 }],
    },
    {
      id: "3",
      name: "LET Advance",
      progress: 0.25,
      status: "Needs Focus",
      color: "#FF4D4D",
      scores: [10, 30, 25],
      weakTopics: [{ topic: "General Science", rate: 12 }],
    },
  ],
  recentQuizzes: [
    {
      id: "q1",
      course: "LET On Boarding",
      title: "Quiz # 3",
      grade: "100%",
      date: "Apr. 1, 2026",
    },
    {
      id: "q2",
      course: "LET Express",
      title: "Quiz # 2",
      grade: "100%",
      date: "Mar. 29, 2026",
    },
    {
      id: "q3",
      course: "LET Advance",
      title: "Quiz # 1",
      grade: "100%",
      date: "Mar. 20, 2026",
    },
    {
      id: "q4",
      course: "LET Express",
      title: "Quiz # 1",
      grade: "100%",
      date: "Mar. 13, 2026",
    },
  ],
};

export default function PerformanceAnalytics() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "course">("overview");
  const [selectedCourseId, setSelectedCourseId] = useState<string>("1");

  const selectedCourse =
    PERFORMANCE_DATA.courses.find((c) => c.id === selectedCourseId) ||
    PERFORMANCE_DATA.courses[0];

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER NAVBAR */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Performance</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* SEGMENTED TABS */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "overview" && styles.activeTab]}
          onPress={() => setActiveTab("overview")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "overview" && styles.activeTabText,
            ]}
          >
            Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "course" && styles.activeTab]}
          onPress={() => setActiveTab("course")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "course" && styles.activeTabText,
            ]}
          >
            By Course
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ================= OVERVIEW TAB ================= */}
        {activeTab === "overview" && (
          <View style={isTablet ? styles.tabletMainWrapper : null}>
            {/* LEFT ROW CONTENT COLUMN (Tablet optimized) */}
            <View style={isTablet ? styles.tabletColumnLeft : null}>
              {/* LPT PASSING PROGRESS MILESTONE */}
              <View style={styles.card}>
                <View style={styles.milestoneHeader}>
                  <Text style={styles.cardTitle}>Road to LPT Passer</Text>
                  <MaterialCommunityIcons
                    name="medal-outline"
                    size={24}
                    color="#FFB800"
                  />
                </View>
                <Text style={styles.subtitleText}>
                  Your overall path readiness metric
                </Text>

                <View style={styles.progressTrackContainer}>
                  <View style={styles.progressBarWrapper}>
                    <View
                      style={[
                        styles.progressBarFilled,
                        { width: `${PERFORMANCE_DATA.overallProgress * 100}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressPercentText}>
                    {PERFORMANCE_DATA.overallProgress * 100}%
                  </Text>
                </View>
              </View>

              {/* METRICS GRID - ADJUSTS HEIGHT ON TABLET */}
              <View style={styles.gridContainer}>
                <View
                  style={[
                    styles.card,
                    styles.gridHalf,
                    { alignItems: "center", justifyContent: "center" },
                  ]}
                >
                  <Text style={styles.metricLabel}>Average Score</Text>
                  <View style={styles.radialPlaceholder}>
                    <Text style={styles.radialValue}>
                      {PERFORMANCE_DATA.averageScore}%
                    </Text>
                  </View>
                </View>

                <View style={styles.gridHalfColumn}>
                  <View style={[styles.card, styles.miniMetricCard]}>
                    <Text style={styles.metricLabel}>Completed Courses</Text>
                    <Text style={styles.bigMetricValue}>
                      {PERFORMANCE_DATA.completedCourses} /{" "}
                      {PERFORMANCE_DATA.totalCourses}
                    </Text>
                  </View>
                  <View style={[styles.card, styles.miniMetricCard]}>
                    <Text style={styles.metricLabel}>Review Frequency</Text>
                    <Text style={styles.frequencySubText}>
                      Active{" "}
                      <Text style={{ color: "#0D2A94", fontWeight: "bold" }}>
                        {PERFORMANCE_DATA.weeklyFrequency} times
                      </Text>{" "}
                      this week
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* RIGHT ROW CONTENT COLUMN (Tablet optimized) */}
            <View style={isTablet ? styles.tabletColumnRight : null}>
              {/* PERFORMANCE BREAKDOWN BY COURSE */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>
                  Overall Performance by Course
                </Text>
                {PERFORMANCE_DATA.courses.map((course) => (
                  <View key={course.id} style={styles.courseProgressRow}>
                    <Text style={styles.courseRowName} numberOfLines={1}>
                      {course.name}
                    </Text>
                    <View style={styles.rowBarContainer}>
                      <View style={styles.rowBarBackground}>
                        <View
                          style={[
                            styles.rowBarFilled,
                            {
                              width: `${course.progress * 100}%`,
                              backgroundColor: course.color,
                            },
                          ]}
                        />
                      </View>
                    </View>
                    <Text style={styles.rowPercentText}>
                      {Math.round(course.progress * 100)}%
                    </Text>
                  </View>
                ))}
              </View>

              {/* RECENT ACTIVITY TABLE */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Recent Quiz Results</Text>
                <View style={styles.tableHeaderRow}>
                  <Text style={[styles.thText, { flex: 2 }]}>Course</Text>
                  <Text style={[styles.thText, { flex: 1.5 }]}>Quiz Title</Text>
                  <Text
                    style={[styles.thText, { flex: 1, textAlign: "center" }]}
                  >
                    Grade
                  </Text>
                  <Text
                    style={[styles.thText, { flex: 1.5, textAlign: "right" }]}
                  >
                    Date Taken
                  </Text>
                </View>
                {PERFORMANCE_DATA.recentQuizzes.map((quiz) => (
                  <View key={quiz.id} style={styles.tableBodyRow}>
                    <Text
                      style={[styles.tdText, { flex: 2, color: "#0D2A94" }]}
                      numberOfLines={1}
                    >
                      {quiz.course}
                    </Text>
                    <Text
                      style={[styles.tdText, { flex: 1.5 }]}
                      numberOfLines={1}
                    >
                      {quiz.title}
                    </Text>
                    <Text
                      style={[
                        styles.tdText,
                        {
                          flex: 1,
                          textAlign: "center",
                          fontWeight: "bold",
                          color: "#4CD964",
                        },
                      ]}
                    >
                      {quiz.grade}
                    </Text>
                    <Text
                      style={[
                        styles.tdText,
                        { flex: 1.5, textAlign: "right", color: "#7F8C8D" },
                      ]}
                    >
                      {quiz.date}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* ================= BY COURSE TAB ================= */}
        {activeTab === "course" && (
          <View style={isTablet ? styles.tabletMainWrapper : null}>
            <View style={{ width: "100%", marginBottom: 12 }}>
              {/* COURSE SELECTOR CHIPS */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.selectorScroll}
              >
                {PERFORMANCE_DATA.courses.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    style={[
                      styles.selectorChip,
                      selectedCourseId === c.id && styles.selectorChipActive,
                    ]}
                    onPress={() => setSelectedCourseId(c.id)}
                  >
                    <Text
                      style={[
                        styles.selectorChipText,
                        selectedCourseId === c.id &&
                          styles.selectorChipTextActive,
                      ]}
                    >
                      {c.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={isTablet ? styles.tabletColumnLeft : null}>
              {/* SCORE TREND CHART */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>
                  {selectedCourse.name} Performance Trend
                </Text>
                <View style={styles.chartContainer}>
                  {selectedCourse.scores.map((score, idx) => (
                    <View key={idx} style={styles.chartColumnWrapper}>
                      <View style={styles.chartBarTrack}>
                        <View
                          style={[
                            styles.chartBarFilled,
                            { height: `${score}%` },
                          ]}
                        />
                      </View>
                      <Text style={styles.chartLabelText}>Q{idx + 1}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            <View style={isTablet ? styles.tabletColumnRight : null}>
              {/* WEAK TOPICS SECTION */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Topics Needing Review</Text>
                <Text style={styles.subtitleText}>
                  Prioritize studying these core target areas
                </Text>
                {selectedCourse.weakTopics.map((topic, index) => (
                  <View key={index} style={styles.weakTopicRow}>
                    <Text style={styles.weakTopicName}>{topic.topic}</Text>
                    <View style={styles.weakProgressWrapper}>
                      <View style={styles.weakProgressBg}>
                        <View
                          style={[
                            styles.weakProgressFilled,
                            { width: `${topic.rate}%` },
                          ]}
                        />
                      </View>
                      <Text style={styles.weakPercentText}>
                        {topic.rate}% Proficiency
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  header: {
    backgroundColor: "#0D2A94",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  backButton: { padding: 4 },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#0D2A94",
    paddingBottom: 2,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },
  activeTab: { borderBottomColor: "#FFB800" },
  tabText: { color: "rgba(255,255,255,0.6)", fontSize: 14, fontWeight: "600" },
  activeTabText: { color: "white", fontWeight: "700" },
  scrollContent: { padding: isTablet ? 24 : 16, paddingBottom: 40 },

  // Responsive Columns Layout Strategy
  tabletMainWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  tabletColumnLeft: { width: "49%" },
  tabletColumnRight: { width: "49%" },

  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2C3E50",
    marginBottom: 12,
  },
  subtitleText: {
    fontSize: 12,
    color: "#7F8C8D",
    marginTop: -8,
    marginBottom: 12,
  },
  milestoneHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressTrackContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  progressBarWrapper: {
    flex: 1,
    height: 10,
    backgroundColor: "#E0E0E0",
    borderRadius: 5,
    overflow: "hidden",
  },
  progressBarFilled: {
    height: "100%",
    backgroundColor: "#0D2A94",
    borderRadius: 5,
  },
  progressPercentText: {
    marginLeft: 12,
    fontSize: 14,
    fontWeight: "700",
    color: "#0D2A94",
  },
  gridContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  gridHalf: { width: "48%", height: isTablet ? 164 : "auto" },
  gridHalfColumn: { width: "48%", justifyContent: "space-between" },
  miniMetricCard: {
    height: isTablet ? 74 : "46%",
    justifyContent: "center",
    marginBottom: isTablet ? 0 : 12,
    paddingVertical: 10,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#7F8C8D",
    marginBottom: 4,
  },
  radialPlaceholder: {
    width: 75,
    height: 75,
    borderRadius: 38,
    borderWidth: 6,
    borderColor: "#4CD964",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 5,
  },
  radialValue: { fontSize: 16, fontWeight: "700", color: "#2C3E50" },
  bigMetricValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0D2A94",
    marginTop: 2,
  },
  frequencySubText: { fontSize: 12, color: "#7F8C8D" },
  courseProgressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  courseRowName: { flex: 3, fontSize: 13, color: "#34495E", fontWeight: "500" },
  rowBarContainer: { flex: 4, paddingHorizontal: 8 },
  rowBarBackground: {
    height: 8,
    backgroundColor: "#ECF0F1",
    borderRadius: 4,
    overflow: "hidden",
  },
  rowBarFilled: { height: "100%", borderRadius: 4 },
  rowPercentText: {
    flex: 1.2,
    textAlign: "right",
    fontSize: 13,
    fontWeight: "600",
    color: "#2C3E50",
  },
  tableHeaderRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ECF0F1",
    paddingBottom: 8,
    marginBottom: 8,
  },
  thText: { fontSize: 11, fontWeight: "700", color: "#95A5A6" },
  tableBodyRow: {
    flexDirection: "row",
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: "#F8F9FA",
    alignItems: "center",
  },
  tdText: { fontSize: 12, color: "#34495E" },
  selectorScroll: { marginBottom: 4 },
  selectorChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#E0E6F8",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  selectorChipActive: { backgroundColor: "#0D2A94" },
  selectorChipText: { fontSize: 13, color: "#0D2A94", fontWeight: "600" },
  selectorChipTextActive: { color: "white" },
  chartContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    height: 160,
    alignItems: "flex-end",
    paddingTop: 20,
  },
  chartColumnWrapper: { alignItems: "center", width: 40 },
  chartBarTrack: {
    height: 120,
    width: 24,
    backgroundColor: "#F1F3F9",
    borderRadius: 6,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  chartBarFilled: {
    width: "100%",
    backgroundColor: "#3498DB",
    borderRadius: 6,
  },
  chartLabelText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "600",
    color: "#7F8C8D",
  },
  weakTopicRow: { marginVertical: 10 },
  weakTopicName: { fontSize: 14, fontWeight: "600", color: "#2C3E50" },
  weakProgressWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  weakProgressBg: {
    flex: 1,
    height: 6,
    backgroundColor: "#ECF0F1",
    borderRadius: 3,
    overflow: "hidden",
  },
  weakProgressFilled: { height: "100%", backgroundColor: "#FF4D4D" },
  weakPercentText: {
    marginLeft: 10,
    fontSize: 11,
    fontWeight: "600",
    color: "#E74C3C",
  },
});
