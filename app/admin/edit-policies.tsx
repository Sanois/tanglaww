import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
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

export default function AdminEditPolicies() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"Privacy" | "Terms">("Privacy");

  const [privacyPolicy, setPrivacyPolicy] = useState(
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  );

  const [termsOfUse, setTermsOfUse] = useState(
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  );

  const handleSave = () => {
    Alert.alert(
      "Changes Saved",
      "The policies have been updated successfully.",
      [{ text: "OK", onPress: () => router.back() }],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Legal & Policies</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveText}>Update</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "Privacy" && styles.activeTab]}
          onPress={() => setActiveTab("Privacy")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "Privacy" && styles.activeTabText,
            ]}
          >
            Privacy Policy
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "Terms" && styles.activeTab]}
          onPress={() => setActiveTab("Terms")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "Terms" && styles.activeTabText,
            ]}
          >
            Terms of Use
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.editorContainer}>
            <Text style={styles.label}>
              Editing:{" "}
              {activeTab === "Privacy" ? "Privacy Policy" : "Terms of Use"}
            </Text>
            <TextInput
              style={styles.textArea}
              multiline
              textAlignVertical="top"
              value={activeTab === "Privacy" ? privacyPolicy : termsOfUse}
              onChangeText={
                activeTab === "Privacy" ? setPrivacyPolicy : setTermsOfUse
              }
              placeholder="Paste or type the policy content here..."
            />
          </View>

          <View style={styles.warningBox}>
            <Ionicons name="alert-circle-outline" size={20} color="#E74C3C" />
            <Text style={styles.warningText}>
              Legal documents affect user rights. Ensure all changes are
              verified by the university administration.
            </Text>
          </View>
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
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "black" },
  saveText: { fontSize: 16, fontWeight: "bold", color: "#2F459B" },
  tabContainer: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#F0F0F0",
    margin: 15,
    borderRadius: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "white",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
  },
  tabText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#888",
  },
  activeTabText: {
    color: "#2F459B",
  },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  editorContainer: { marginTop: 10 },
  label: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#999",
    textTransform: "uppercase",
    marginBottom: 10,
  },
  textArea: {
    backgroundColor: "#FDFDFD",
    borderWidth: 1,
    borderColor: "#EEE",
    borderRadius: 15,
    padding: 20,
    fontSize: 15,
    color: "#333",
    minHeight: 400,
    lineHeight: 22,
  },
  warningBox: {
    flexDirection: "row",
    backgroundColor: "#FFF5F5",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFEBEB",
  },
  warningText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 12,
    color: "#E74C3C",
  },
});
