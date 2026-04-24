import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAdmin } from "../../context/AdminContext";
import { supabase } from "../../lib/supabase";
import {
  adminLockCourseForAll,
  adminLockCourseForStudent,
  adminUnlockCourseForAll,
  adminUnlockCourseForStudent,
} from "../../services/courseAccessService";
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

interface EnrolledStudent {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  hasAccess: boolean;
}

export default function AdminCourses() {
  const router = useRouter();
  const { currentAdminId } = useAdmin();
  const [expandedCourse, setExpandedCourse] = useState<number | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<"unlock" | "lock">("unlock");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [enrolledStudents, setEnrolledStudents] = useState<EnrolledStudent[]>(
    [],
  );
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | "all" | null>(
    null,
  );

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    const { data, error } = await supabase
      .from("course")
      .select("course_id, courseName, isActive, instructor")
      .order("course_id");

    if (error) {
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

  const getAdminName = async (): Promise<string> => {
    if (!currentAdminId) return "Admin";
    const { data } = await supabase
      .from("admin")
      .select("firstName, lastName")
      .eq("admin_id", currentAdminId)
      .single();
    return data ? `${data.firstName} ${data.lastName}` : "Admin";
  };

  const openModal = async (course: Course, mode: "unlock" | "lock") => {
    setSelectedCourse(course);
    setModalMode(mode);
    setModalVisible(true);
    setStudentsLoading(true);

    const { data: students } = await supabase
      .from("student")
      .select("id, firstName, lastName, email")
      .eq("isAccountSetup", true)
      .order("firstName");

    const { data: accessRows } = await supabase
      .from("course_access")
      .select("student_id")
      .eq("course_id", course.course_id);

    const accessSet = new Set((accessRows ?? []).map((r) => r.student_id));

    setEnrolledStudents(
      (students ?? []).map((s) => ({ ...s, hasAccess: accessSet.has(s.id) })),
    );

    setStudentsLoading(false);
  };

  const handleUnlockSingle = async (student: EnrolledStudent) => {
    if (!selectedCourse || !currentAdminId) return;
    setActionLoadingId(student.id);
    const adminName = await getAdminName();
    const result = await adminUnlockCourseForStudent(
      student.id,
      selectedCourse.course_id,
      currentAdminId,
      adminName,
      `${student.firstName} ${student.lastName}`,
      selectedCourse.courseName,
    );
    setActionLoadingId(null);
    if (result.success) {
      setEnrolledStudents((prev) =>
        prev.map((s) => (s.id === student.id ? { ...s, hasAccess: true } : s)),
      );
    } else Alert.alert("Error", result.error ?? "Something went wrong.");
  };

  const handleUnlockAll = async () => {
    if (!selectedCourse || !currentAdminId) return;
    Alert.alert(
      "Unlock for Everyone",
      `Give ALL students access to "${selectedCourse.courseName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Unlock All",
          onPress: async () => {
            setActionLoadingId("all");
            const adminName = await getAdminName();
            const result = await adminUnlockCourseForAll(
              selectedCourse.course_id,
              currentAdminId,
              adminName,
              selectedCourse.courseName,
            );
            setActionLoadingId(null);
            if (result.success) {
              setEnrolledStudents((prev) =>
                prev.map((s) => ({ ...s, hasAccess: true })),
              );
              Alert.alert("Done", `${result.count} student(s) unlocked.`);
            } else
              Alert.alert("Error", result.error ?? "Something went wrong.");
          },
        },
      ],
    );
  };

  const handleLockSingle = async (student: EnrolledStudent) => {
    if (!selectedCourse || !currentAdminId) return;
    Alert.alert(
      "Lock Course",
      `Remove ${student.firstName}'s access to "${selectedCourse.courseName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Lock",
          style: "destructive",
          onPress: async () => {
            setActionLoadingId(student.id);
            const adminName = await getAdminName();
            const result = await adminLockCourseForStudent(
              student.id,
              selectedCourse.course_id,
              currentAdminId,
              adminName,
              `${student.firstName} ${student.lastName}`,
              selectedCourse.courseName,
            );
            setActionLoadingId(null);
            if (result.success) {
              setEnrolledStudents((prev) =>
                prev.map((s) =>
                  s.id === student.id ? { ...s, hasAccess: false } : s,
                ),
              );
            } else
              Alert.alert("Error", result.error ?? "Something went wrong.");
          },
        },
      ],
    );
  };

  const handleLockAll = async () => {
    if (!selectedCourse || !currentAdminId) return;
    Alert.alert(
      "Lock for Everyone",
      `Remove ALL students' access to "${selectedCourse.courseName}"? This cannot be undone easily.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Lock All",
          style: "destructive",
          onPress: async () => {
            setActionLoadingId("all");
            const adminName = await getAdminName();
            const result = await adminLockCourseForAll(
              selectedCourse.course_id,
              currentAdminId,
              adminName,
              selectedCourse.courseName,
            );
            setActionLoadingId(null);
            if (result.success) {
              setEnrolledStudents((prev) =>
                prev.map((s) => ({ ...s, hasAccess: false })),
              );
              Alert.alert("Done", `${result.count} student(s) locked out.`);
            } else
              Alert.alert("Error", result.error ?? "Something went wrong.");
          },
        },
      ],
    );
  };

  const toggleExpand = (courseId: number) => {
    setExpandedCourse(expandedCourse === courseId ? null : courseId);
  };

  const CourseCard = ({ course }: { course: Course }) => {
    const isExpanded = expandedCourse === course.course_id;
    const primaryModule = course.modules[0] ?? null;

    const navigateTo = (screen: "handout" | "recorded-sessions") => {
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
          onPress={() => toggleExpand(course.course_id)}
        >
          <View style={styles.imagePlaceholder}>
            {/* Admin always sees the image placeholder, never locked */}
            <Ionicons name="image-outline" size={40} color="#CCC" />
            {/* Locked badge for student-side context */}
          </View>

          <View style={styles.cardFooter}>
            <View style={{ flex: 1 }}>
              <Text style={styles.courseTitle}>{course.courseName}</Text>
              <Text style={styles.instructorText}>
                {course.instructor ?? "—"}
              </Text>
            </View>
            <View style={styles.cardActions}>
              {/* Unlock button */}
              <TouchableOpacity
                style={styles.keyBtn}
                onPress={() => openModal(course, "unlock")}
              >
                <Ionicons name="lock-open-outline" size={16} color="#27ae60" />
              </TouchableOpacity>
              {/* Lock button */}
              <TouchableOpacity
                style={[styles.keyBtn, { borderColor: "#e74c3c" }]}
                onPress={() => openModal(course, "lock")}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={16}
                  color="#e74c3c"
                />
              </TouchableOpacity>
              <Ionicons
                name={isExpanded ? "chevron-up" : "chevron-down"}
                size={24}
                color="#2F459B"
              />
            </View>
          </View>
        </TouchableOpacity>

        {isExpanded && (
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

  const isUnlockMode = modalMode === "unlock";

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

      {/* ── Unlock / Lock Modal ──────────────────────────────────────────────── */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.modalTitle,
                    { color: isUnlockMode ? "#27ae60" : "#e74c3c" },
                  ]}
                >
                  {isUnlockMode ? "Unlock Course" : "Lock Course"}
                </Text>
                <Text style={styles.modalSubtitle} numberOfLines={1}>
                  {selectedCourse?.courseName}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {/* Bulk action button */}
            <TouchableOpacity
              style={[
                styles.bulkBtn,
                { backgroundColor: isUnlockMode ? "#27ae60" : "#e74c3c" },
                actionLoadingId === "all" && { opacity: 0.7 },
              ]}
              onPress={isUnlockMode ? handleUnlockAll : handleLockAll}
              disabled={actionLoadingId === "all"}
            >
              {actionLoadingId === "all" ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <Ionicons name="people-outline" size={18} color="white" />
                  <Text style={styles.bulkBtnText}>
                    {isUnlockMode
                      ? "Unlock for All Students"
                      : "Lock for All Students"}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <Text style={styles.orDivider}>— or manage individually —</Text>

            {studentsLoading ? (
              <ActivityIndicator color="#2F459B" style={{ marginTop: 20 }} />
            ) : (
              <ScrollView
                style={styles.studentList}
                showsVerticalScrollIndicator={false}
              >
                {enrolledStudents.length === 0 ? (
                  <Text style={styles.emptyText}>
                    No activated students found.
                  </Text>
                ) : (
                  enrolledStudents.map((student) => (
                    <View key={student.id} style={styles.studentRow}>
                      <View style={styles.studentInfo}>
                        <Text style={styles.studentName}>
                          {student.firstName} {student.lastName}
                        </Text>
                        <Text style={styles.studentEmail}>{student.email}</Text>
                      </View>

                      {isUnlockMode ? (
                        student.hasAccess ? (
                          <View style={styles.accessBadge}>
                            <Ionicons
                              name="checkmark-circle"
                              size={16}
                              color="#27ae60"
                            />
                            <Text style={styles.accessBadgeText}>Unlocked</Text>
                          </View>
                        ) : (
                          <TouchableOpacity
                            style={[
                              styles.actionBtn,
                              { backgroundColor: "#27ae60" },
                              actionLoadingId === student.id && {
                                opacity: 0.6,
                              },
                            ]}
                            onPress={() => handleUnlockSingle(student)}
                            disabled={actionLoadingId === student.id}
                          >
                            {actionLoadingId === student.id ? (
                              <ActivityIndicator size="small" color="white" />
                            ) : (
                              <Text style={styles.actionBtnText}>Unlock</Text>
                            )}
                          </TouchableOpacity>
                        )
                      ) : student.hasAccess ? (
                        <TouchableOpacity
                          style={[
                            styles.actionBtn,
                            { backgroundColor: "#e74c3c" },
                            actionLoadingId === student.id && { opacity: 0.6 },
                          ]}
                          onPress={() => handleLockSingle(student)}
                          disabled={actionLoadingId === student.id}
                        >
                          {actionLoadingId === student.id ? (
                            <ActivityIndicator size="small" color="white" />
                          ) : (
                            <Text style={styles.actionBtnText}>Lock</Text>
                          )}
                        </TouchableOpacity>
                      ) : (
                        <View style={styles.lockedBadgeSmall}>
                          <Ionicons
                            name="lock-closed"
                            size={14}
                            color="#e74c3c"
                          />
                          <Text style={styles.lockedBadgeSmallText}>
                            Locked
                          </Text>
                        </View>
                      )}
                    </View>
                  ))
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

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
  lockedBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e74c3c",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  lockedBadgeText: { color: "white", fontSize: 10, fontWeight: "bold" },
  cardFooter: { padding: 15, flexDirection: "row", alignItems: "center" },
  courseTitle: { fontSize: 16, fontWeight: "bold", color: "black" },
  instructorText: { fontSize: 13, color: "#777", marginTop: 2 },
  lockedNote: {
    fontSize: 11,
    color: "#e74c3c",
    marginTop: 4,
    fontStyle: "italic",
  },
  cardActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  keyBtn: {
    padding: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#27ae60",
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: "80%",
  },
  modalHeader: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: "bold" },
  modalSubtitle: { fontSize: 13, color: "#777", marginTop: 2 },
  bulkBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
    borderRadius: 10,
    gap: 8,
    marginBottom: 16,
  },
  bulkBtnText: { color: "white", fontWeight: "bold", fontSize: 15 },
  orDivider: {
    textAlign: "center",
    color: "#999",
    fontSize: 12,
    marginBottom: 16,
  },
  studentList: { maxHeight: 350 },
  emptyText: { color: "#999", textAlign: "center", fontSize: 13 },
  studentRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  studentInfo: { flex: 1 },
  studentName: { fontSize: 14, fontWeight: "600", color: "#1A1A2E" },
  studentEmail: { fontSize: 11, color: "#95A5A6", marginTop: 2 },
  accessBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "#f0fff4",
  },
  accessBadgeText: { fontSize: 12, color: "#27ae60", fontWeight: "600" },
  lockedBadgeSmall: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "#fff5f5",
  },
  lockedBadgeSmallText: { fontSize: 12, color: "#e74c3c", fontWeight: "600" },
  actionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  actionBtnText: { color: "white", fontSize: 12, fontWeight: "600" },
});
