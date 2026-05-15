import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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

export default function AdminAffirmation() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [existing, setExisting] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAffirmation();
  }, []);

  const fetchAffirmation = async () => {
    const { data } = await supabase
      .from("affirmation")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      setExisting(data);
      setContent(data.content);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!content.trim()) {
      Alert.alert("Error", "Please enter an affirmation.");
      return;
    }

    setSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in.");

      if (existing) {
        const { error } = await supabase
          .from("affirmation")
          .update({ content: content.trim() })
          .eq("id", existing.id);
        if (error) throw new Error(error.message);
      } else {
        const { error } = await supabase
          .from("affirmation")
          .insert({ content: content.trim(), admin_id: user.id });
        if (error) throw new Error(error.message);
      }

      Alert.alert("Saved!", "Daily affirmation has been updated.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert("Error", err.message ?? "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Daily Affirmation</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.infoSection}>
            <Ionicons name="heart" size={40} color="#FFD75E" />
            <Text style={styles.infoTitle}>Set Today's Affirmation</Text>
            <Text style={styles.infoSubtitle}>
              This message will be displayed to all students on their dashboard
              to motivate and inspire them.
            </Text>
          </View>

          {loading ? (
            <ActivityIndicator color="#2F459B" style={{ marginTop: 20 }} />
          ) : (
            <View style={styles.form}>
              <Text style={styles.label}>Affirmation Message:</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder={`"You're one step closer to your dream, Future LPTs!"`}
                placeholderTextColor="#999"
                value={content}
                onChangeText={setContent}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />
              {existing && (
                <Text style={styles.lastUpdated}>
                  Last updated:{" "}
                  {new Date(existing.created_at).toLocaleDateString("en-PH", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Text>
              )}
            </View>
          )}

          <TouchableOpacity
            style={[styles.saveBtn, saving && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={saving || loading}
          >
            {saving ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text style={styles.saveText}>
                  {existing ? "Update Affirmation" : "Set Affirmation"}
                </Text>
                <Ionicons
                  name="heart"
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
    marginBottom: 8,
    color: "#333",
  },
  textArea: {
    height: 130,
    paddingTop: 15,
  },
  lastUpdated: { fontSize: 11, color: "#95A5A6", fontStyle: "italic" },
  saveBtn: {
    backgroundColor: "#2F459B",
    padding: 18,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
  },
  saveText: { color: "white", fontWeight: "bold", fontSize: 16 },
});
