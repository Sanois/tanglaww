import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { WebView } from "react-native-webview";
import { useAdmin } from "../../context/AdminContext";
import {
    deleteMaterial,
    downloadMaterial,
    getMaterialsByModule,
    LearningMaterial,
    uploadHandout,
} from "../../services/materialService";

// ─── Helpers ───────────────────────────────────────────────────────────────────
const formatBytes = (bytes: number | null) => {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const fileIconName = (type: string) => {
  if (type === "pdf") return "file-pdf-box";
  if (type === "docx" || type === "doc") return "file-word-box";
  return "file-outline";
};

const fileIconColor = (type: string) => {
  if (type === "pdf") return "#E74C3C";
  if (type === "docx" || type === "doc") return "#2980B9";
  return "#95A5A6";
};

// ─── In-App Viewer ─────────────────────────────────────────────────────────────
// Uses Google Docs viewer so PDF and Word both render without any extra library.
function InAppViewer({
  material,
  onClose,
}: {
  material: LearningMaterial;
  onClose: () => void;
}) {
  const [webLoading, setWebLoading] = useState(true);
  const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(
    material.fileUrl,
  )}&embedded=true`;

  return (
    <SafeAreaView style={viewer.container}>
      <View style={viewer.header}>
        <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
          <Ionicons name="arrow-back" size={22} color="white" />
        </TouchableOpacity>
        <Text style={viewer.headerTitle} numberOfLines={1}>
          {material.title}
        </Text>
      </View>

      {webLoading && (
        <View style={viewer.loadingOverlay}>
          <ActivityIndicator size="large" color="#2F459B" />
          <Text style={viewer.loadingText}>Loading document…</Text>
        </View>
      )}

      <WebView
        source={{ uri: viewerUrl }}
        style={{ flex: 1 }}
        onLoadStart={() => setWebLoading(true)}
        onLoadEnd={() => setWebLoading(false)}
        javaScriptEnabled
        domStorageEnabled
      />
    </SafeAreaView>
  );
}

// ─── Main Screen ───────────────────────────────────────────────────────────────
export default function HandoutScreen() {
  const router = useRouter();
  const { moduleId: moduleIdParam, courseTitle = "Course" } =
    useLocalSearchParams<{ moduleId: string; courseTitle: string }>();

  const moduleId = Number(moduleIdParam);
  const { isAdmin, currentAdminId } = useAdmin();

  const [handouts, setHandouts] = useState<LearningMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [viewingMaterial, setViewingMaterial] =
    useState<LearningMaterial | null>(null);

  const fetchHandouts = useCallback(async () => {
    setLoading(true);
    const data = await getMaterialsByModule(moduleId, "handout");
    setHandouts(data);
    setLoading(false);
  }, [moduleId]);

  useEffect(() => {
    if (moduleId) fetchHandouts();
  }, [fetchHandouts]);

  const handleUpload = async () => {
    if (!currentAdminId) return;
    setUploading(true);
    const result = await uploadHandout(moduleId, currentAdminId);
    setUploading(false);
    if (result.success) fetchHandouts();
    else if (result.error) Alert.alert("Upload Failed", result.error);
  };

  const handleDelete = (item: LearningMaterial) => {
    Alert.alert(
      "Delete Handout",
      `Delete "${item.title}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const result = await deleteMaterial(item);
            if (result.success) fetchHandouts();
            else Alert.alert("Error", result.error);
          },
        },
      ],
    );
  };

  const handleDownload = async (item: LearningMaterial) => {
    setDownloadingId(item.material_id);
    const result = await downloadMaterial(item);
    setDownloadingId(null);

    if (!result.success) {
      Alert.alert("Download Failed", result.error ?? "Unknown error");
      return;
    }

    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert("Saved", `File saved to app storage.`);
        return;
      }

      // Share sheet appears — user can tap "Save to Downloads", "Open with", etc.
      await Sharing.shareAsync(result.uri!, {
        mimeType:
          item.fileType === "pdf"
            ? "application/pdf"
            : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        dialogTitle: "Save or open file",
        UTI:
          item.fileType === "pdf"
            ? "com.adobe.pdf"
            : "org.openxmlformats.wordprocessingml.document",
      });
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  // If a document is selected, show the viewer full-screen
  if (viewingMaterial) {
    return (
      <InAppViewer
        material={viewingMaterial}
        onClose={() => setViewingMaterial(null)}
      />
    );
  }

  const renderItem = ({ item }: { item: LearningMaterial }) => {
    const isDownloading = downloadingId === item.material_id;
    return (
      <View style={styles.fileCard}>
        <View style={styles.fileIconWrap}>
          <MaterialCommunityIcons
            name={fileIconName(item.fileType) as any}
            size={40}
            color={fileIconColor(item.fileType)}
          />
        </View>
        <View style={styles.fileMeta}>
          <Text style={styles.fileName} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.fileSub}>
            {formatBytes(item.fileSize)} · {formatDate(item.uploadedAt)}
          </Text>
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => setViewingMaterial(item)}
            >
              <Ionicons name="eye-outline" size={15} color="#2F459B" />
              <Text style={styles.actionBtnText}>View</Text>
            </TouchableOpacity>

            {item.isDownloadable && (
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => handleDownload(item)}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <ActivityIndicator size="small" color="#2F459B" />
                ) : (
                  <>
                    <Ionicons
                      name="download-outline"
                      size={15}
                      color="#2F459B"
                    />
                    <Text style={styles.actionBtnText}>Download</Text>
                  </>
                )}
              </TouchableOpacity>
            )}

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
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Handouts</Text>
      </View>

      <View style={styles.courseLabelWrap}>
        <Text style={styles.courseLabel}>{courseTitle}</Text>
        <Text style={styles.courseSub}>Handouts</Text>
      </View>

      {isAdmin && (
        <TouchableOpacity
          style={[styles.uploadBtn, uploading && { opacity: 0.7 }]}
          onPress={handleUpload}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons name="cloud-upload-outline" size={20} color="white" />
              <Text style={styles.uploadBtnText}>Upload Handout</Text>
            </>
          )}
        </TouchableOpacity>
      )}

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2F459B" />
        </View>
      ) : handouts.length === 0 ? (
        <View style={styles.centered}>
          <MaterialCommunityIcons
            name="file-search-outline"
            size={60}
            color="#BDC3C7"
          />
          <Text style={styles.emptyText}>No handouts yet.</Text>
          {isAdmin && (
            <Text style={styles.emptyHint}>
              Tap "Upload Handout" to add files.
            </Text>
          )}
        </View>
      ) : (
        <FlatList
          data={handouts}
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
        <Text style={styles.navLabel}>Handouts</Text>
        <TouchableOpacity disabled>
          <Ionicons name="chevron-forward" size={24} color="#DCDFE3" />
        </TouchableOpacity>
      </View>
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
});

const viewer = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  header: {
    backgroundColor: "#0D2A94",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: "bold", color: "white" },
  loadingOverlay: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    zIndex: 10,
  },
  loadingText: { marginTop: 10, color: "#777", fontSize: 14 },
});
