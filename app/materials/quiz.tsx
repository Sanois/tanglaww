import { supabase } from "@/lib/supabase";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useAdmin } from "../../context/AdminContext";
import { logAudit } from "../../services/auditService";

interface Quiz {
  id: number;
  title: string;
  url: string;
  created_at: string;
  course_id: number;
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

export default function QuizScreen() {
  const router = useRouter();
  const { courseId: courseIdParam, courseTitle = "Course" } =
    useLocalSearchParams<{ courseId: string; courseTitle: string }>();
  const courseId = Number(courseIdParam);
  const { isAdmin, currentStudentId } = useAdmin();

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchQuizzes = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("quizzes")
      .select("id, title, url, created_at, course_id")
      .eq("course_id", courseId)
      .order("id", { ascending: false });

    if (error) console.error("fetchQuizzes:", error.message);
    setQuizzes(data ?? []);
    setLoading(false);
  }, [courseId]);

  useEffect(() => {
    if (courseId) fetchQuizzes();
  }, [fetchQuizzes]);

  const handleAdd = async () => {
    if (!newTitle.trim() || !newUrl.trim()) {
      Alert.alert("Error", "Please enter both a title and a URL.");
      return;
    }
    if (
      !newUrl.startsWith("https://forms.gle/") &&
      !newUrl.startsWith("https://docs.google.com/forms/")
    ) {
      Alert.alert(
        "Invalid URL",
        "Please enter a valid Google Forms link (forms.gle or docs.google.com/forms).",
      );
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("quizzes").insert({
      course_id: courseId,
      title: newTitle.trim(),
      url: newUrl.trim(),
    });
    setSaving(false);
    if (error) {
      Alert.alert("Error", error.message);
    } else {
      setNewTitle("");
      setNewUrl("");
      setAddModalVisible(false);
      fetchQuizzes();
    }
  };

  const handleOpen = async (quiz: Quiz) => {
    Alert.alert(
      "Open Quiz",
      `You will be redirected to Google Forms to take "${quiz.title}". Continue?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Open",
          onPress: async () => {
            await WebBrowser.openBrowserAsync(quiz.url);
            if (!isAdmin && currentStudentId) {
              await logAudit({
                actorType: "student",
                actorId: String(currentStudentId),
                action: "student_opened_quiz",
                targetType: "quiz",
                targetId: String(quiz.id),
                targetName: quiz.title,
                metadata: { courseTitle, courseId },
              });
            }
          },
        },
      ],
    );
  };

  const handleDelete = (quiz: Quiz) => {
    Alert.alert("Delete Quiz", `Remove "${quiz.title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const { error } = await supabase
            .from("quizzes")
            .delete()
            .eq("id", quiz.id);
          if (error) Alert.alert("Error", error.message);
          else fetchQuizzes();
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: Quiz }) => (
    <View style={styles.fileCard}>
      <View style={styles.fileIconWrap}>
        <MaterialCommunityIcons name="google" size={32} color="#EA4335" />
      </View>
      <View style={styles.fileMeta}>
        <Text style={styles.fileName} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.fileSub}>
          Google Forms · {formatDate(item.created_at)}
        </Text>
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleOpen(item)}
          >
            <Ionicons name="open-outline" size={15} color="#2F459B" />
            <Text style={styles.actionBtnText}>Take Quiz</Text>
          </TouchableOpacity>
          {isAdmin && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.deleteBtn]}
              onPress={() => handleDelete(item)}
            >
              <Ionicons name="trash-outline" size={15} color="#E74C3C" />
              <Text style={[styles.actionBtnText, { color: "#E74C3C" }]}>
                Delete
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quiz</Text>
      </View>

      <View style={styles.courseLabelWrap}>
        <Text style={styles.courseLabel}>{courseTitle}</Text>
        <Text style={styles.courseSub}>Quizzes</Text>
      </View>

      {isAdmin && (
        <TouchableOpacity
          style={styles.uploadBtn}
          onPress={() => setAddModalVisible(true)}
        >
          <Ionicons name="add-circle-outline" size={20} color="white" />
          <Text style={styles.uploadBtnText}>Add Quiz Link</Text>
        </TouchableOpacity>
      )}

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2F459B" />
        </View>
      ) : quizzes.length === 0 ? (
        <View style={styles.centered}>
          <MaterialCommunityIcons
            name="clipboard-text-search-outline"
            size={60}
            color="#BDC3C7"
          />
          <Text style={styles.emptyText}>No quizzes yet.</Text>
          {isAdmin && (
            <Text style={styles.emptyHint}>
              Tap "Add Quiz Link" to add a quiz.
            </Text>
          )}
        </View>
      ) : (
        <FlatList
          data={quizzes}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      <View style={styles.bottomNav}>
        <TouchableOpacity disabled>
          <Ionicons name="chevron-back" size={24} color="#DCDFE3" />
        </TouchableOpacity>
        <Text style={styles.navLabel}>Quizzes</Text>
        <TouchableOpacity disabled>
          <Ionicons name="chevron-forward" size={24} color="#DCDFE3" />
        </TouchableOpacity>
      </View>

      {/* Add Quiz Modal */}
      <Modal visible={addModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Quiz Link</Text>
              <TouchableOpacity onPress={() => setAddModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Quiz Title</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Module 1 Quiz"
              value={newTitle}
              onChangeText={setNewTitle}
            />

            <Text style={styles.inputLabel}>Google Forms URL</Text>
            <TextInput
              style={styles.input}
              placeholder="https://forms.gle/..."
              value={newUrl}
              onChangeText={setNewUrl}
              autoCapitalize="none"
              keyboardType="url"
            />

            <TouchableOpacity
              style={[styles.saveBtn, saving && { opacity: 0.7 }]}
              onPress={handleAdd}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.saveBtnText}>Add Quiz</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  header: {
    backgroundColor: "#0D2A94",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginLeft: 15,
  },
  courseLabelWrap: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  courseLabel: { fontSize: 17, fontWeight: "bold", color: "#0D2A94" },
  courseSub: { fontSize: 13, color: "#777", marginTop: 2 },
  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2F459B",
    marginHorizontal: 20,
    marginTop: 16,
    paddingVertical: 13,
    borderRadius: 10,
    gap: 8,
  },
  uploadBtnText: { color: "white", fontWeight: "bold", fontSize: 15 },
  listContent: { padding: 20, paddingBottom: 100 },
  fileCard: {
    flexDirection: "row",
    backgroundColor: "#F8F9FC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8ECF4",
    padding: 14,
    marginBottom: 14,
    alignItems: "flex-start",
  },
  fileIconWrap: {
    width: 52,
    height: 52,
    backgroundColor: "white",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E0E4EF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    flexShrink: 0,
  },
  fileMeta: { flex: 1 },
  fileName: { fontSize: 14, fontWeight: "600", color: "#1A1A2E" },
  fileSub: { fontSize: 11, color: "#95A5A6", marginTop: 3 },
  actions: { flexDirection: "row", marginTop: 10, gap: 8, flexWrap: "wrap" },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#2F459B",
    backgroundColor: "white",
    gap: 4,
  },
  actionBtnText: { fontSize: 12, color: "#2F459B", fontWeight: "600" },
  deleteBtn: { borderColor: "#E74C3C" },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: { fontSize: 16, color: "#95A5A6", marginTop: 12 },
  emptyHint: { fontSize: 13, color: "#BDC3C7", marginTop: 6 },
  bottomNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: "#EEE",
  },
  navLabel: { fontSize: 16, color: "black", fontWeight: "500" },
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
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: "#1A1A2E" },
  inputLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#555",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#EEE",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 16,
    color: "#333",
  },
  saveBtn: {
    backgroundColor: "#2F459B",
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: "center",
  },
  saveBtnText: { color: "white", fontWeight: "bold", fontSize: 15 },
});
