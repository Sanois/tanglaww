import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAdmin } from "../../context/AdminContext";
import { supabase } from "../../lib/supabase";
import { getModulesByCourse } from "../../services/materialService";
import AdminHamburger from "./hamburger";

interface Module {
  module_id: number;
  moduleName: string;
}

interface Course {
  course_id: number;
  courseName: string;
  isActive: boolean;
  instructor: string | null;
  modules: Module[];
}

export default function AdminCourses() {
  const router = useRouter();
  const { isAdmin } = useAdmin();
  const [expandedCourse, setExpandedCourse] = useState<number | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
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

  const toggleExpand = (courseId: number) => {
    setExpandedCourse(expandedCourse === courseId ? null : courseId);
  };

  const CourseCard = ({ course }: { course: Course }) => {
    const isExpanded = expandedCourse === course.course_id;
    const isLocked = !course.isActive;
    const primaryModule = course.modules[0] ?? null;

    const navigateTo = (screen: "handout" | "recorded-sessions") => {
      console.log("primaryModule:", primaryModule);
      console.log("courseTitle:", course.courseName);
      if (!primaryModule) return;
      router.push({
        pathname: `/materials/${screen}` as any,
        params: {
          moduleId: String(primaryModule.module_id),
          courseTitle: course.courseName,
        },
      });
    };

    return (
      <View style={styles.cardContainer}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.courseCard}
          onPress={() => !isLocked && toggleExpand(course.course_id)}
        >
          <View style={styles.imagePlaceholder}>
            {isLocked ? (
              <View style={styles.lockOverlay}>
                <Ionicons name="lock-closed" size={40} color="black" />
              </View>
            ) : (
              <Ionicons name="image-outline" size={40} color="#CCC" />
            )}
          </View>

          <View style={styles.cardFooter}>
            <View style={{ flex: 1 }}>
              <Text style={styles.courseTitle}>{course.courseName}</Text>
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
                color="#2F459B"
              />
            )}
          </View>
        </TouchableOpacity>

        {isExpanded && !isLocked && (
          <View style={styles.dropdownContent}>
            <TouchableOpacity
              style={styles.dropItem}
              onPress={() => navigateTo("handout")}
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
              onPress={() => navigateTo("recorded-sessions")}
            >
              <Ionicons name="videocam-outline" size={20} color="#2F459B" />
              <Text style={styles.dropText}>Recorded Sessions</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.dropItem}>
              <Ionicons name="bulb-outline" size={20} color="#2F459B" />
              <Text style={styles.dropText}>Quiz</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.dropItem}>
              <Ionicons name="share-outline" size={20} color="#2F459B" />
              <Text style={styles.dropText}>Online Session Link</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.dropItem, { borderBottomWidth: 0 }]}
            >
              <Ionicons name="add-circle-outline" size={20} color="#BDC3C7" />
              <Text style={[styles.dropText, { color: "#BDC3C7" }]}>
                Add new section
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setMenuVisible(true)}>
          <Ionicons name="menu" size={28} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Courses</Text>
      </View>

      <AdminHamburger
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
      />

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2F459B" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {courses.map((course) => (
            <CourseCard key={course.course_id} course={course} />
          ))}
        </ScrollView>
      )}

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push("/admin/dashboard")}
        >
          <Ionicons name="home-outline" size={24} color="#2F459B" />
          <Text style={styles.tabLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push("/admin/approval")}
        >
          <Ionicons name="person-outline" size={24} color="#2F459B" />
          <Text style={styles.tabLabel}>Approvals</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push("/admin/calendar")}
        >
          <Ionicons name="calendar-outline" size={24} color="#2F459B" />
          <Text style={styles.tabLabel}>Calendar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="school" size={24} color="#FFD75E" />
          <Text style={[styles.tabLabel, { color: "#FFD75E" }]}>Courses</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  header: {
    backgroundColor: "#FFD75E",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "black",
    marginLeft: 20,
  },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollContent: { padding: 20, paddingBottom: 100 },
  cardContainer: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#EEE",
  },
  courseCard: { backgroundColor: "white" },
  imagePlaceholder: {
    width: "100%",
    height: 120,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
  },
  lockOverlay: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  cardFooter: { padding: 15, flexDirection: "row", alignItems: "center" },
  courseTitle: { fontSize: 16, fontWeight: "bold", color: "black" },
  lockedNote: {
    fontSize: 11,
    color: "#E74C3C",
    marginTop: 4,
    fontStyle: "italic",
  },
  dropdownContent: {
    backgroundColor: "#F0F2F8",
    paddingHorizontal: 15,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: "#EEE",
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
  tabBar: {
    position: "absolute",
    bottom: 0,
    flexDirection: "row",
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#EEE",
    paddingVertical: 10,
    width: "100%",
  },
  tabItem: { flex: 1, alignItems: "center" },
  tabLabel: { fontSize: 10, marginTop: 4, color: "#2F459B" },
  instructorText: { fontSize: 13, color: "#777", marginTop: 2 },
});
