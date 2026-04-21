import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function EditProfileScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.formContent}>
        <View style={styles.profileCard}>
          <View style={styles.banner}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarCircle}>
                <Ionicons name="person-outline" size={60} color="#BDC3C7" />
                <TouchableOpacity style={styles.cameraIcon}>
                  <Ionicons name="pencil" size={16} color="black" />
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity style={styles.bannerEditIcon}>
              <Ionicons name="pencil" size={20} color="white" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Username</Text>
              <TextInput style={styles.input} defaultValue="John Doe D. Pili" />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Curriculum</Text>
              <TextInput
                style={styles.input}
                defaultValue="Bachelor of Elementary Education"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputWithIcon}>
                <TextInput
                  style={{ flex: 1 }}
                  defaultValue="johndoejacat10@gmail.com"
                />
                <Ionicons name="pencil" size={18} color="#555" />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contact Number</Text>
              <View style={styles.inputWithIcon}>
                <TextInput style={{ flex: 1 }} defaultValue="0912-345-6789" />
                <Ionicons name="pencil" size={18} color="#555" />
              </View>
            </View>

            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => router.back()}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  header: {
    backgroundColor: "#0D2A94",
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  headerTitle: { color: "white", fontSize: 18, fontWeight: "bold" },
  formContent: { padding: 20 },
  profileCard: {
    backgroundColor: "white",
    borderRadius: 20,
    overflow: "hidden",
    elevation: 3,
    paddingBottom: 20,
  },
  banner: {
    backgroundColor: "#0D2A94",
    height: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarContainer: { position: "relative", marginTop: 30 },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#000",
  },
  cameraIcon: {
    position: "absolute",
    right: 0,
    top: 10,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 2,
    borderWidth: 1,
  },
  bannerEditIcon: { position: "absolute", top: 15, right: 15 },
  inputContainer: { padding: 20, marginTop: 40 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "bold", color: "#555", marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#BDC3C7",
    borderRadius: 8,
    padding: 12,
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#BDC3C7",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 50,
  },
  doneButton: {
    backgroundColor: "#0D2A94",
    borderRadius: 8,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  doneButtonText: { color: "white", fontWeight: "bold", fontSize: 16 },
});
