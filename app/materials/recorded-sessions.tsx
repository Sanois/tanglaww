import { logAudit } from "@/services/auditService";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Linking,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import YoutubePlayer from "react-native-youtube-iframe";
import { useAdmin } from "../../context/AdminContext";
import {
  addRecordedSession,
  deleteMaterial,
  getMaterialsByModule,
  LearningMaterial,
} from "../../services/materialService";

const { width } = Dimensions.get("window");

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const extractYoutubeId = (url: string): string | null => {
  const patterns = [
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
};

function AddSessionModal({
  visible,
  onClose,
  onSaved,
  moduleId,
  adminId,
}: {
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
  moduleId: number;
  adminId: string;
}) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [urlError, setUrlError] = useState("");

  const reset = () => {
    setTitle("");
    setUrl("");
    setUrlError("");
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("Validation", "Enter a session title.");
      return;
    }
    const videoId = extractYoutubeId(url.trim());
    if (!videoId) {
      setUrlError(
        "Invalid YouTube URL. Accepted formats:\n• https://youtu.be/VIDEO_ID\n• https://youtube.com/watch?v=VIDEO_ID",
      );
      return;
    }
    setUrlError("");
    setSaving(true);
    const result = await addRecordedSession(
      moduleId,
      adminId,
      title.trim(),
      url.trim(),
      videoId,
    );
    setSaving(false);
    if (result.success) {
      reset();
      onSaved();
      onClose();
    } else Alert.alert("Error", result.error);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={modal.overlay}>
        <View style={modal.sheet}>
          <View style={modal.header}>
            <Text style={modal.headerText}>Add Recorded Session</Text>
            <TouchableOpacity
              onPress={() => {
                reset();
                onClose();
              }}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView keyboardShouldPersistTaps="handled">
            <Text style={modal.label}>Session Title *</Text>
            <TextInput
              style={modal.input}
              placeholder="e.g. Week 1 – Introduction"
              placeholderTextColor="#BDC3C7"
              value={title}
              onChangeText={setTitle}
            />
            <Text style={modal.label}>YouTube URL *</Text>
            <TextInput
              style={[modal.input, urlError ? modal.inputError : null]}
              placeholder="https://youtu.be/VIDEO_ID"
              placeholderTextColor="#BDC3C7"
              value={url}
              onChangeText={(t) => {
                setUrl(t);
                setUrlError("");
              }}
              autoCapitalize="none"
              keyboardType="url"
            />
            {urlError ? (
              <Text style={modal.errorText}>{urlError}</Text>
            ) : (
              <Text style={modal.hint}>Paste an unlisted YouTube link.</Text>
            )}
          </ScrollView>

          <TouchableOpacity
            style={[modal.saveBtn, saving && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={modal.saveBtnText}>Save Session</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function PlayerModal({
  session,
  onClose,
  onViewed,
}: {
  session: LearningMaterial | null;
  onClose: () => void;
  onViewed?: (session: LearningMaterial) => void;
}) {
  const [playing, setPlaying] = useState(false);
  const [logged, setLogged] = useState(false);

  useEffect(() => {
    if (session) {
      setPlaying(false);
      setLogged(false);
    }
  }, [session?.material_id]);

  if (!session?.youtubeId) return null;

  const handleStateChange = (state: string) => {
    if (state === "playing") {
      setPlaying(true);
      if (!logged && onViewed) {
        setLogged(true);
        onViewed(session);
      }
    }
    if (state === "paused" || state === "ended") setPlaying(false);
  };

  return (
    <Modal visible animationType="slide">
      <SafeAreaView style={player.container}>
        <View style={player.header}>
          <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
            <Ionicons name="arrow-back" size={22} color="white" />
          </TouchableOpacity>
          <Text style={player.headerTitle} numberOfLines={1}>
            {session.title}
          </Text>
        </View>

        <View style={player.videoWrap}>
          <YoutubePlayer
            height={width * 0.5625}
            width={width}
            videoId={session.youtubeId}
            play={playing}
            onChangeState={handleStateChange}
          />
        </View>

        <View style={player.info}>
          <Text style={player.sessionTitle}>{session.title}</Text>
          <Text style={player.sessionDate}>
            Added {formatDate(session.uploadedAt)}
          </Text>
        </View>

        <TouchableOpacity
          style={player.ytBtn}
          onPress={() => Linking.openURL(session.fileUrl)}
        >
          <Ionicons name="logo-youtube" size={20} color="#E74C3C" />
          <Text style={player.ytBtnText}>Open in YouTube</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </Modal>
  );
}

export default function RecordedSessionsScreen() {
  const router = useRouter();
  const { moduleId: moduleIdParam, courseTitle = "Course" } =
    useLocalSearchParams<{ moduleId: string; courseTitle: string }>();

  const moduleId = Number(moduleIdParam);
  const { isAdmin, currentAdminId, currentStudentId } = useAdmin();

  const [sessions, setSessions] = useState<LearningMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [activeSession, setActiveSession] = useState<LearningMaterial | null>(
    null,
  );

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    const data = await getMaterialsByModule(moduleId, "recorded_session");
    setSessions(data);
    setLoading(false);
  }, [moduleId]);

  useEffect(() => {
    if (moduleId) fetchSessions();
  }, [fetchSessions]);

  const handleDelete = (item: LearningMaterial) => {
    Alert.alert("Delete Session", `Delete "${item.title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const result = await deleteMaterial(item);
          if (result.success) fetchSessions();
          else Alert.alert("Error", result.error);
        },
      },
    ]);
  };

  const handleSessionViewed = async (session: LearningMaterial) => {
    if (!isAdmin && currentStudentId) {
      await logAudit({
        actorType: "student",
        actorId: String(currentStudentId),
        action: "student_viewed_session",
        targetType: "session",
        targetId: String(session.material_id),
        targetName: session.title,
        metadata: { courseTitle, moduleId },
      });
    }
  };

  const renderItem = ({ item }: { item: LearningMaterial }) => (
    <View style={styles.sessionCard}>
      <TouchableOpacity
        style={styles.thumbnailWrap}
        onPress={() => setActiveSession(item)}
        activeOpacity={0.85}
      >
        <View style={styles.thumbnailPlaceholder}>
          <Ionicons name="logo-youtube" size={36} color="#E74C3C" />
          <View style={styles.playBadge}>
            <Ionicons name="play" size={12} color="white" />
          </View>
        </View>
      </TouchableOpacity>

      <View style={styles.sessionInfo}>
        <Text style={styles.sessionTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.sessionDate}>{formatDate(item.uploadedAt)}</Text>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => setActiveSession(item)}
          >
            <Ionicons name="play-circle-outline" size={15} color="#2F459B" />
            <Text style={styles.actionBtnText}>Play</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => Linking.openURL(item.fileUrl)}
          >
            <Ionicons name="open-outline" size={15} color="#2F459B" />
            <Text style={styles.actionBtnText}>YouTube</Text>
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
        <Text style={styles.headerTitle}>Recorded Sessions</Text>
      </View>

      <View style={styles.courseLabelWrap}>
        <Text style={styles.courseLabel}>{courseTitle}</Text>
        <Text style={styles.courseSub}>Recorded Sessions</Text>
      </View>

      {isAdmin && (
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setAddModalVisible(true)}
        >
          <Ionicons name="add-circle-outline" size={20} color="white" />
          <Text style={styles.addBtnText}>Add Session</Text>
        </TouchableOpacity>
      )}

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2F459B" />
        </View>
      ) : sessions.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="videocam-off-outline" size={60} color="#BDC3C7" />
          <Text style={styles.emptyText}>No recorded sessions yet.</Text>
          {isAdmin && (
            <Text style={styles.emptyHint}>
              Tap "Add Session" to add a YouTube link.
            </Text>
          )}
        </View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item) => String(item.material_id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      <View style={styles.bottomNav}>
        <TouchableOpacity disabled>
          <Ionicons name="chevron-back" size={24} color="#DCDFE3" />
        </TouchableOpacity>
        <Text style={styles.navLabel}>Recorded Sessions</Text>
        <TouchableOpacity disabled>
          <Ionicons name="chevron-forward" size={24} color="#DCDFE3" />
        </TouchableOpacity>
      </View>

      {isAdmin && currentAdminId && (
        <AddSessionModal
          visible={addModalVisible}
          onClose={() => setAddModalVisible(false)}
          onSaved={fetchSessions}
          moduleId={moduleId}
          adminId={currentAdminId}
        />
      )}

      <PlayerModal
        session={activeSession}
        onClose={() => setActiveSession(null)}
        onViewed={handleSessionViewed}
      />
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
  addBtn: {
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
  addBtnText: { color: "white", fontWeight: "bold", fontSize: 15 },
  listContent: { padding: 20, paddingBottom: 100 },
  sessionCard: {
    flexDirection: "row",
    backgroundColor: "#F8F9FC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8ECF4",
    marginBottom: 14,
    overflow: "hidden",
  },
  thumbnailWrap: { width: 90, flexShrink: 0 },
  thumbnailPlaceholder: {
    width: 90,
    height: "100%",
    minHeight: 90,
    backgroundColor: "#1A1A2E",
    justifyContent: "center",
    alignItems: "center",
  },
  playBadge: {
    position: "absolute",
    bottom: 6,
    right: 6,
    backgroundColor: "#E74C3C",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  sessionInfo: { flex: 1, padding: 12 },
  sessionTitle: { fontSize: 14, fontWeight: "600", color: "#1A1A2E" },
  sessionDate: { fontSize: 11, color: "#95A5A6", marginTop: 3 },
  actions: { flexDirection: "row", marginTop: 10, gap: 8, flexWrap: "wrap" },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
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
});

const modal = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerText: { fontSize: 18, fontWeight: "bold", color: "#1A1A2E" },
  label: { fontSize: 13, fontWeight: "600", color: "#555", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#DCDFE3",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#1A1A2E",
    backgroundColor: "#F8F9FC",
    marginBottom: 6,
  },
  inputError: { borderColor: "#E74C3C" },
  errorText: { fontSize: 12, color: "#E74C3C", marginBottom: 16 },
  hint: { fontSize: 12, color: "#95A5A6", marginBottom: 16 },
  saveBtn: {
    backgroundColor: "#2F459B",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  saveBtnText: { color: "white", fontWeight: "bold", fontSize: 15 },
});

const player = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0D0D1A" },
  header: {
    backgroundColor: "#0D2A94",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: "bold", color: "white" },
  videoWrap: { backgroundColor: "black" },
  info: { padding: 20 },
  sessionTitle: { fontSize: 17, fontWeight: "bold", color: "white" },
  sessionDate: { fontSize: 12, color: "#666", marginTop: 4 },
  ytBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    paddingVertical: 13,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E74C3C",
    gap: 8,
  },
  ytBtnText: { color: "#E74C3C", fontWeight: "bold", fontSize: 14 },
});
