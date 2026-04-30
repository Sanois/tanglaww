import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAdmin } from "../context/AdminContext";

export default function EditProfileScreen() {
  const router = useRouter();
  const { currentStudentId } = useAdmin();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [fullName, setFullName] = useState("—");
  const [email, setEmail] = useState("—");
  const [curriculum, setCurriculum] = useState("—");

  useEffect(() => {
    const fetchStudent = async () => {
      if (!currentStudentId) return;

      const { data } = await supabase
        .from("student")
        .select(
          `
          firstName,
          lastName,
          middleName,
          email,
          phoneNumber,
          profilephotourl,
          enrollment (
            curriculum!enrollment_curriculum_id_fkey (curriculumName)
          )
        `,
        )
        .eq("id", currentStudentId)
        .single();

      if (data) {
        const name = `${data.firstName}${data.middleName ? " " + data.middleName + "." : ""} ${data.lastName}`;
        setFullName(name);
        setEmail(data.email ?? "—");
        setPhoneNumber(data.phoneNumber ?? "");
        setExistingPhotoUrl(data.profilephotourl ?? null);

        const curriculumName =
          (data.enrollment as any)?.[0]?.curriculum?.curriculumName ?? "—";
        setCurriculum(curriculumName);
      }
      setFetching(false);
    };
    fetchStudent();
  }, [currentStudentId]);

  const handlePickPhoto = () => {
    Alert.alert("Profile Photo", "Choose an option", [
      {
        text: "Camera",
        onPress: async () => {
          const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          });
          if (!result.canceled) setPhotoUri(result.assets[0].uri);
        },
      },
      {
        text: "Gallery",
        onPress: async () => {
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          });
          if (!result.canceled) setPhotoUri(result.assets[0].uri);
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const uploadPhoto = async (): Promise<string | null> => {
    if (!photoUri || !currentStudentId) return null;

    const fileName = `${currentStudentId}_${Date.now()}.jpg`;
    const response = await fetch(photoUri);
    const arrayBuffer = await response.arrayBuffer();

    const { error } = await supabase.storage
      .from("profiles")
      .upload(`photos/${fileName}`, arrayBuffer, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (error) {
      console.error("Photo upload error:", error.message);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from("profiles")
      .getPublicUrl(`photos/${fileName}`);

    return urlData.publicUrl;
  };

  const handleSave = async () => {
    if (!currentStudentId) return;

    const cleaned = phoneNumber.replace(/\s|-/g, "");
    if (cleaned && !/^(09|\+639)\d{9}$/.test(cleaned)) {
      Alert.alert(
        "Invalid Number",
        "Please enter a valid Philippine mobile number (e.g. 0912-345-6789).",
      );
      return;
    }

    setLoading(true);
    try {
      const photoUrl = await uploadPhoto();

      const { error } = await supabase
        .from("student")
        .update({
          phoneNumber: phoneNumber.trim(),
          ...(photoUrl ? { profilephotourl: photoUrl } : {}),
        })
        .eq("id", currentStudentId);

      if (error) throw new Error(error.message);

      Alert.alert("Saved", "Your profile has been updated.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert("Error", err.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#0D2A94" style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  const displayPhoto = photoUri ?? existingPhotoUrl;

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
              <TouchableOpacity onPress={handlePickPhoto}>
                <View style={styles.avatarCircle}>
                  {displayPhoto ? (
                    <Image
                      source={{ uri: displayPhoto }}
                      style={styles.avatarImage}
                    />
                  ) : (
                    <Ionicons name="person-outline" size={60} color="#BDC3C7" />
                  )}
                  <View style={styles.cameraIcon}>
                    <Ionicons name="camera" size={14} color="white" />
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.photoNoteWrap}>
            <Ionicons
              name="information-circle-outline"
              size={15}
              color="#2F459B"
            />
            <Text style={styles.photoNote}>
              We highly recommend using a clear, formal photo for your profile.
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View style={[styles.inputWithIcon, styles.readonlyField]}>
                <Text style={[styles.fieldText, { flex: 1 }]}>{fullName}</Text>
                <Ionicons
                  name="lock-closed-outline"
                  size={14}
                  color="#95A5A6"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Curriculum</Text>
              <View style={[styles.inputWithIcon, styles.readonlyField]}>
                <Text style={[styles.fieldText, { flex: 1 }]}>
                  {curriculum}
                </Text>
                <Ionicons
                  name="lock-closed-outline"
                  size={14}
                  color="#95A5A6"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={[styles.inputWithIcon, styles.readonlyField]}>
                <Text style={[styles.fieldText, { flex: 1 }]}>{email}</Text>
                <Ionicons
                  name="lock-closed-outline"
                  size={14}
                  color="#95A5A6"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contact Number</Text>
              <View style={styles.inputWithIcon}>
                <TextInput
                  style={{ flex: 1, fontSize: 15, color: "#333" }}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder="e.g. 0912-345-6789"
                  placeholderTextColor="#BDC3C7"
                  keyboardType="phone-pad"
                />
                <Ionicons name="pencil" size={16} color="#2F459B" />
              </View>
            </View>

            <View style={styles.readonlyNotice}>
              <Ionicons name="lock-closed-outline" size={14} color="#95A5A6" />
              <Text style={styles.readonlyNoticeText}>
                Other profile details can only be changed by your administrator.
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.doneButton, loading && { opacity: 0.7 }]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.doneButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6FA" },
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    paddingBottom: 24,
  },
  banner: {
    backgroundColor: "#0D2A94",
    height: 100,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  avatarContainer: { marginBottom: -40 },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "white",
    overflow: "hidden",
  },
  avatarImage: { width: 90, height: 90, borderRadius: 45 },
  cameraIcon: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: "#2F459B",
    borderRadius: 10,
    padding: 4,
    borderWidth: 1.5,
    borderColor: "white",
  },
  photoNoteWrap: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#EEF1FF",
    marginHorizontal: 20,
    marginTop: 52,
    marginBottom: 4,
    padding: 10,
    borderRadius: 8,
    gap: 6,
  },
  photoNote: {
    flex: 1,
    fontSize: 12,
    color: "#2F459B",
    lineHeight: 17,
  },
  inputContainer: { padding: 20, paddingTop: 12 },
  inputGroup: { marginBottom: 16 },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#555",
    marginBottom: 6,
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
  readonlyField: {
    backgroundColor: "#F8F9FA",
    borderColor: "#EBEBEB",
  },
  fieldText: {
    fontSize: 14,
    color: "#888",
  },
  readonlyNotice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#EBEBEB",
  },
  readonlyNoticeText: {
    flex: 1,
    fontSize: 12,
    color: "#95A5A6",
    lineHeight: 16,
  },
  doneButton: {
    backgroundColor: "#0D2A94",
    borderRadius: 8,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  doneButtonText: { color: "white", fontWeight: "bold", fontSize: 16 },
});
