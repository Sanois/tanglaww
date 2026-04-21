import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    FlatList,
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

export default function AdminEditHelp() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"FAQ" | "Contact">("FAQ");

  const [faqs, setFaqs] = useState([
    {
      id: "1",
      q: "How to reset my password?",
      a: "Go to the login screen and click 'Forgot Password'.",
    },
    {
      id: "2",
      q: "Where can I find review materials?",
      a: "Navigate to the Courses tab in your dashboard.",
    },
  ]);

  const [contactInfo, setContactInfo] = useState({
    email: "support@tanglaw.edu.ph",
    phone: "+63 912 345 6789",
    office: "Sa bubong ng tanglaw, University Campus",
  });

  const handleSave = () => {
    Alert.alert("Success", "Help information has been updated.", [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  const updateFaq = (id: string, field: "q" | "a", text: string) => {
    setFaqs((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [field]: text } : f)),
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Help & FAQ</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "FAQ" && styles.activeTab]}
          onPress={() => setActiveTab("FAQ")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "FAQ" && styles.activeTabText,
            ]}
          >
            FAQs
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "Contact" && styles.activeTab]}
          onPress={() => setActiveTab("Contact")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "Contact" && styles.activeTabText,
            ]}
          >
            Contact Us
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {activeTab === "FAQ" ? (
          <FlatList
            data={faqs}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.scrollContent}
            renderItem={({ item }) => (
              <View style={styles.faqCard}>
                <Text style={styles.inputLabel}>Question</Text>
                <TextInput
                  style={styles.input}
                  value={item.q}
                  onChangeText={(txt) => updateFaq(item.id, "q", txt)}
                />
                <Text style={styles.inputLabel}>Answer</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  multiline
                  value={item.a}
                  onChangeText={(txt) => updateFaq(item.id, "a", txt)}
                />
              </View>
            )}
          />
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Support Email</Text>
              <TextInput
                style={styles.input}
                value={contactInfo.email}
                onChangeText={(txt) =>
                  setContactInfo({ ...contactInfo, email: txt })
                }
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={contactInfo.phone}
                onChangeText={(txt) =>
                  setContactInfo({ ...contactInfo, phone: txt })
                }
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Office Location</Text>
              <TextInput
                style={styles.input}
                value={contactInfo.office}
                onChangeText={(txt) =>
                  setContactInfo({ ...contactInfo, office: txt })
                }
              />
            </View>
          </ScrollView>
        )}
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
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  saveText: { fontSize: 16, fontWeight: "bold", color: "#2F459B" },
  tabContainer: {
    flexDirection: "row",
    padding: 15,
    backgroundColor: "#F8F9FA",
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 8 },
  activeTab: { backgroundColor: "#2F459B" },
  tabText: { fontSize: 14, fontWeight: "bold", color: "#666" },
  activeTabText: { color: "white" },
  scrollContent: { padding: 20 },
  faqCard: {
    backgroundColor: "#F9F9F9",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  inputGroup: { marginBottom: 20 },
  inputLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#2F459B",
    marginBottom: 5,
    marginTop: 5,
  },
  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  textArea: { minHeight: 80, textAlignVertical: "top" },
});
