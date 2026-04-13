import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function AdminNotification() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePublish = async () => {
    if (!title.trim() || !message.trim()) {
      Alert.alert("Error", "Please fill in both the title and the message.");
      return;
    }

    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in.");

      const { error } = await supabase.from("announcements").insert({
        admin_id: user.id,
        title: title.trim(),
        content: message.trim(),
      });

      if (error) throw new Error(error.message);

      Alert.alert(
        "Published!",
        "Announcement is now visible to all students.",
        [{ text: "OK", onPress: () => router.back() }],
      );
    } catch (err: any) {
      Alert.alert("Error", err.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Announcement</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.infoSection}>
            <Ionicons name="megaphone" size={40} color="#FFD75E" />
            <Text style={styles.infoTitle}>Broadcast Message</Text>
            <Text style={styles.infoSubtitle}>
              The information you post here will be visible to all students on
              their dashboards.
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Announcement Title:*</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Enrollment Update"
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.label}>Message Body:*</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Type your announcement here..."
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={[styles.publishBtn, loading && { opacity: 0.7 }]}
            onPress={handlePublish}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text style={styles.publishText}>Publish Announcement</Text>
                <Ionicons
                  name="send"
                  size={18}
                  color="white"
                  style={{ marginLeft: 10 }}
                />
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
    justifyContent: "space-between",
  },
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "black" },
  content: { padding: 25 },
  infoSection: {
    alignItems: "center",
    marginBottom: 30,
    backgroundColor: "#F8F9FA",
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2F459B",
    marginTop: 10,
  },
  infoSubtitle: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    marginTop: 5,
    lineHeight: 18,
  },
  form: { marginBottom: 30 },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2F459B",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#DCDFE3",
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
    color: "#333",
  },
  textArea: { height: 150, paddingTop: 15 },
  publishBtn: {
    backgroundColor: "#2F459B",
    padding: 18,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
  },
  publishText: { color: "white", fontWeight: "bold", fontSize: 16 },
});
