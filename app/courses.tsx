import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
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

export default function CoursesScreen() {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      const { data, error } = await supabase
        .from("course")
        .select("course_id, courseName, isActive, instructor")
        .order("course_id");

      if (error) {
        console.error("fetchCourses:", error.message);
        setLoading(false);
        return;
      }

      const coursesWithModules = await Promise.all(
        (data ?? []).map(async (c) => {
          const modules = await getModulesByCourse(c.course_id);
          return { ...c, modules };
        }),
      );

      setCourses(coursesWithModules);
      setLoading(false);
    };

    fetchCourses();
  }, []);

  const toggleDropdown = (courseId: number) => {
    setExpandedId(expandedId === courseId ? null : courseId);
  };

  const navigateTo = (
    screen: "handout" | "recorded-sessions",
    course: Course,
  ) => {
    const primaryModule = course.modules[0] ?? null;
    if (!primaryModule) return;
    router.push({
      pathname: `/materials/${screen}` as any,
      params: {
        moduleId: String(primaryModule.module_id),
        courseTitle: course.courseName,
      },
    });
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
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {courses.map((course) => {
            const isLocked = !course.isActive;
            const isExpanded = expandedId === course.course_id;
            const progress = getProgress(course.course_id);
            const isOnboarding = course.course_id === 1;

            return (
              <View key={course.course_id} style={styles.cardContainer}>
                <TouchableOpacity
                  style={styles.courseCard}
                  onPress={() => !isLocked && toggleDropdown(course.course_id)}
                  activeOpacity={0.9}
                >
                  <View style={styles.imageSection}>
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
                    <Ionicons
                      name={isLocked ? "lock-closed" : "image-outline"}
                      size={40}
                      color={isLocked ? "#333" : "#BDC3C7"}
                    />
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
                      style={styles.dropdownItem}
                      onPress={() => navigateTo("handout", course)}
                    >
                      <Ionicons
                        name="document-text-outline"
                        size={20}
                        color="#2F459B"
                      />
                      <Text style={styles.dropdownText}>Handouts</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => navigateTo("recorded-sessions", course)}
                    >
                      <Ionicons
                        name="play-circle-outline"
                        size={20}
                        color="#2F459B"
                      />
                      <Text style={styles.dropdownText}>Recorded Sessions</Text>
                    </TouchableOpacity>

                    {!isOnboarding && (
                      <>
                        <TouchableOpacity style={styles.dropdownItem}>
                          <Ionicons
                            name="bulb-outline"
                            size={20}
                            color="#2F459B"
                          />
                          <Text style={styles.dropdownText}>Quiz</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.dropdownItem}>
                          <Ionicons
                            name="share-outline"
                            size={20}
                            color="#2F459B"
                          />
                          <Text style={styles.dropdownText}>
                            Online Session Link
                          </Text>
                        </TouchableOpacity>
                      </>
                    )}
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
    justifyContent: "center",
    alignItems: "center",
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
    fontStyle: "italic",
  },
  dropdownContent: {
    backgroundColor: "#F0F2F8",
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    padding: 10,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  dropdownText: {
    marginLeft: 10,
    color: "#2F459B",
    fontWeight: "500",
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
});
