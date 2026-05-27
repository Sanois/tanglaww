import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useAdmin } from "../context/AdminContext";
import { supabase } from "../lib/supabase";
import { getModulesByCourse } from "../services/materialService";
import HamburgerMenu from "./hamburger";

interface Module {
  module_id: number;
  moduleName: string;
}

interface Course {
  course_id: number;
  courseName: string;
  instructor: string | null;
  isActive: boolean;
  modules: Module[];
}

const courseImages: Record<number, any> = {
  1: require("../assets/images/let-on-boarding.jpg"),
  2: require("../assets/images/let-express.jpg"),
  3: require("../assets/images/let-advanced.jpg"),
  4: require("../assets/images/integrative.jpg"),
  5: require("../assets/images/final-coaching.jpg"),
  6: require("../assets/images/test-highlights.jpg"),
};

export default function CoursesScreen() {
  const router = useRouter();
  const { currentStudentId } = useAdmin();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [accessibleCourseIds, setAccessibleCourseIds] = useState<Set<number>>(
    new Set(),
  );
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, [currentStudentId]);

  const fetchCourses = async () => {
    if (!currentStudentId) return;

    const { data, error } = await supabase
      .from("course")
      .select("course_id, courseName, isActive, instructor")
      .order("course_id");

    if (error) {
      console.error("fetchCourses:", error.message);
      setLoading(false);
      return;
    }

    const { data: accessRows } = await supabase
      .from("course_access")
      .select("course_id")
      .eq("student_id", currentStudentId);

    setAccessibleCourseIds(new Set((accessRows ?? []).map((r) => r.course_id)));

    const coursesWithModules = await Promise.all(
      (data ?? []).map(async (c) => {
        const modules = await getModulesByCourse(c.course_id);
        return { ...c, modules };
      }),
    );

    setCourses(coursesWithModules);
    setLoading(false);
  };

  const onRefresh = useCallback(async () => {
    setRefresh(true);
    await fetchCourses();
    setRefresh(false);
  }, [fetchCourses]);

  const toggleDropdown = (courseId: number) => {
    setExpandedId(expandedId === courseId ? null : courseId);
  };

  const navigateTo = (
    screen: "handout" | "recorded-sessions" | "quiz" | "session-links",
    course: Course,
  ) => {
    if (screen === "handout" || screen === "recorded-sessions") {
      const primaryModule = course.modules[0] ?? null;
      if (!primaryModule) return;
      router.push({
        pathname: `/materials/${screen}` as any,
        params: {
          moduleId: String(primaryModule.module_id),
          courseTitle: course.courseName,
        },
      });
    } else {
      router.push({
        pathname: `/materials/${screen}` as any,
        params: {
          courseId: String(course.course_id),
          courseTitle: course.courseName,
        },
      });
    }
  };

  const getProgress = (courseId: number) => 0;

  return (
    <SafeAreaView style={styles.container}>
      <Modal
        animationType="fade"
        transparent={true}
        visible={isMenuVisible}
        onRequestClose={() => setIsMenuVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <HamburgerMenu onClose={() => setIsMenuVisible(false)} />
          <TouchableWithoutFeedback onPress={() => setIsMenuVisible(false)}>
            <View style={styles.clickableOverlay} />
          </TouchableWithoutFeedback>
        </View>
      </Modal>

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => setIsMenuVisible(true)}>
            <Ionicons name="menu" size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Courses</Text>
        </View>
        <TouchableOpacity>
          <MaterialCommunityIcons name="chart-bar" size={26} color="white" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2F459B" />
        </View>
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refresh}
              onRefresh={onRefresh}
              colors={["#2F459B"]}
            />
          }
          contentContainerStyle={styles.scrollContent}
        >
          {courses.map((course) => {
            const isLocked =
              !course.isActive && !accessibleCourseIds.has(course.course_id);
            const isExpanded = expandedId === course.course_id;
            const progress = getProgress(course.course_id);
            // const isOnboarding = course.course_id === 1; if need to hide quiz and session links for onboarding course

            return (
              <View key={course.course_id} style={styles.cardContainer}>
                <TouchableOpacity
                  style={styles.courseCard}
                  onPress={() => !isLocked && toggleDropdown(course.course_id)}
                  activeOpacity={0.9}
                >
                  <View style={styles.imageSection}>
                    {courseImages[course.course_id] ? (
                      <Image
                        source={courseImages[course.course_id]}
                        style={{ width: "100%", height: "100%" }}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={{ flex: 1, backgroundColor: "#F2F4F7" }} />
                    )}

                    <View style={styles.progressBadge}>
                      <View
                        style={[
                          styles.progressCircle,
                          {
                            borderColor:
                              progress === 100 ? "#2ECC71" : "#BDC3C7",
                          },
                        ]}
                      />
                      <Text style={styles.progressText}>{progress}%</Text>
                    </View>

                    {isLocked && (
                      <View style={styles.lockOverlay}>
                        <Ionicons name="lock-closed" size={36} color="white" />
                      </View>
                    )}
                  </View>

                  <View style={styles.infoSection}>
                    <View style={styles.textContainer}>
                      <Text style={styles.courseTitleText}>
                        {course.courseName}
                      </Text>
                      <Text style={styles.instructorText}>
                        {course.instructor ?? "—"}
                      </Text>
                      {isLocked && (
                        <Text style={styles.lockedNote}>
                          This course is currently locked
                        </Text>
                      )}
                    </View>
                    {!isLocked && (
                      <Ionicons
                        name={isExpanded ? "chevron-up" : "chevron-down"}
                        size={24}
                        color="#BDC3C7"
                      />
                    )}
                  </View>
                </TouchableOpacity>

                {isExpanded && !isLocked && (
                  <View style={styles.dropdownContent}>
                    <TouchableOpacity
                      style={styles.dropItem}
                      onPress={() => navigateTo("handout", course)}
                    >
                      <Ionicons
                        name="document-text-outline"
                        size={20}
                        color="#2F459B"
                      />
                      <Text style={styles.dropText}>Handouts</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.dropItem}
                      onPress={() => navigateTo("recorded-sessions", course)}
                    >
                      <Ionicons
                        name="videocam-outline"
                        size={20}
                        color="#2F459B"
                      />
                      <Text style={styles.dropText}>Recorded Sessions</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.dropItem}
                      onPress={() => navigateTo("quiz", course)}
                    >
                      <Ionicons name="bulb-outline" size={20} color="#2F459B" />
                      <Text style={styles.dropText}>Quiz</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.dropItem}
                      onPress={() => navigateTo("session-links", course)}
                    >
                      <Ionicons
                        name="share-outline"
                        size={20}
                        color="#2F459B"
                      />
                      <Text style={styles.dropText}>Online Session Link</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      )}

      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.replace("/homepage")}
        >
          <Ionicons name="home-outline" size={24} color="#2F459B" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.replace("/courses")}
        >
          <FontAwesome5 name="graduation-cap" size={20} color="#FFB800" />
          <Text style={[styles.navText, { color: "#FFB800" }]}>Courses</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.replace("/calendar")}
        >
          <Ionicons name="calendar-outline" size={24} color="#2F459B" />
          <Text style={styles.navText}>Calendar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.replace("/profile")}
        >
          <Ionicons name="person-outline" size={24} color="#2F459B" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  modalOverlay: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  clickableOverlay: { flex: 1 },
  header: {
    backgroundColor: "#0D2A94",
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  headerTitle: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    marginLeft: 15,
  },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollContent: { padding: 15, paddingBottom: 100 },
  cardContainer: { marginBottom: 15 },
  courseCard: {
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
  },
  imageSection: {
    height: 120,
    backgroundColor: "#F2F4F7",
    overflow: "hidden",
  },
  progressBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EEE",
  },
  progressCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    marginRight: 5,
  },
  progressText: { fontSize: 10, fontWeight: "bold", color: "#555" },
  infoSection: { flexDirection: "row", alignItems: "center", padding: 15 },
  textContainer: { flex: 1 },
  courseTitleText: { fontSize: 15, fontWeight: "bold", color: "#333" },
  instructorText: { fontSize: 12, color: "#7F8C8D" },
  lockedNote: {
    fontSize: 11,
    color: "#E74C3C",
    marginTop: 4,
  },
  dropdownContent: {
    backgroundColor: "#F0F2F8",
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    padding: 10,
  },
  dropItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  dropText: {
    fontSize: 14,
    color: "#2F459B",
    fontWeight: "500",
    marginLeft: 15,
    textDecorationLine: "underline",
  },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 70,
    backgroundColor: "white",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#EEE",
  },
  navItem: { alignItems: "center" },
  navText: { fontSize: 12, marginTop: 4, color: "#2F459B" },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
});
