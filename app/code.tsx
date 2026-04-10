import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    ImageBackground,
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
import { supabase } from "../lib/supabase";

const { width } = Dimensions.get("window");
const headerBg = require("../assets/images/llpt.jpg");

type StatusType = "pending" | "approved" | "rejected" | null;

export default function CheckStatusScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<StatusType>(null);
  const [studentData, setStudentData] = useState<any>(null);
  const [rejectionNotes, setRejectionNotes] = useState("");

  const handleCheckStatus = async () => {
    if (!email.trim() || !lastName.trim()) {
      setError("Please enter both email and last name.");
      return;
    }

    setError("");
    setLoading(true);
    setStatus(null);

    try {
      const { data: student, error: studentError } = await supabase
        .from("student")
        .select("id, firstName, lastName, email")
        .eq("email", email.trim().toLowerCase())
        .ilike("lastName", lastName.trim())
        .single();

      if (studentError || !student) {
        setError("No registration found with that email and last name.");
        setLoading(false);
        return;
      }

      const { data: enrollment, error: enrollmentError } = await supabase
        .from("enrollment")
        .select(
          `
            enrollment_id,
            student_id,
            verification!enrollment_verification_id_fkey (
                verificationStatus,
                verificationNotes
                )
            `,
        )
        .eq("student_id", student.id)
        .single();

      if (enrollmentError || !enrollment) {
        setError("No enrollment found for this account.");
        setLoading(false);
        return;
      }

      const v = Array.isArray(enrollment.verification)
        ? enrollment.verification[0]
        : enrollment.verification;

      setStudentData(student);

      if (v?.verificationStatus === true) {
        setStatus("approved");
      } else if (v?.verificationStatus === false && v?.verificationNotes) {
        setStatus("rejected");
        setRejectionNotes(v.verificationNotes);
      } else {
        setStatus("pending");
      }
    } catch (err: any) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderStatus = () => {
    if (!status || !studentData) return null;

    if (status === "pending") {
      return (
        <View style={[styles.statusCard, styles.pendingCard]}>
          <Ionicons name="time-outline" size={50} color="#FFB800" />
          <View style={styles.statusTitleRow}>
            <View style={[styles.statusDot, { backgroundColor: "#FFB800" }]} />
            <Text style={styles.statusTitle}>Under Review</Text>
          </View>
          <Text style={styles.statusName}>Hello, {studentData.firstName}!</Text>
          <Text style={styles.statusMessage}>
            Your enrollment is currently being reviewed by our admin team.
            Please check back later.
          </Text>
        </View>
      );
    }

    if (status === "approved") {
      return (
        <View style={[styles.statusCard, styles.pendingCard]}>
          <Ionicons name="checkmark-circle" size={50} color="#27ae60" />
          <View style={styles.statusTitleRow}>
            <View style={[styles.statusDot, { backgroundColor: "#27ae60" }]} />
            <Text style={styles.statusTitle}>Approved</Text>
          </View>
          <Text style={styles.statusName}>
            Congratulations, {studentData.firstName}!
          </Text>
          <Text style={styles.statusMessage}>
            Your enrollment has been approved. You may now set up your account.
          </Text>
          <TouchableOpacity
            style={styles.setupBtn}
            onPress={() =>
              router.push({
                pathname: "/profilesetup",
                params: {
                  email: studentData.email,
                  studentId: studentData.id,
                },
              } as any)
            }
          >
            <Text style={styles.setupBtnText}>Set Up My Account</Text>
            <Ionicons
              name="arrow-forward"
              size={18}
              color="white"
              style={{ marginLeft: 8 }}
            />
          </TouchableOpacity>
        </View>
      );
    }

    if (status === "rejected") {
      return (
        <View style={[styles.statusCard, styles.rejectedCard]}>
          <Ionicons name="close-circle" size={50} color="#e74c3c" />
          <View style={styles.statusTitleRow}>
            <View style={[styles.statusDot, { backgroundColor: "#e74c3c" }]} />
            <Text style={styles.statusTitle}>Not Approved</Text>
          </View>
          <Text style={styles.statusName}>Hello, {studentData.firstName}.</Text>
          <Text style={styles.statusMessage}>
            Unfortunately your enrollment was not approved at this time.
          </Text>
          {rejectionNotes ? (
            <View style={styles.notesBox}>
              <Text style={styles.notesLabel}>Admin Notes:</Text>
              <Text style={styles.notesText}>{rejectionNotes}</Text>
            </View>
          ) : null}
        </View>
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ImageBackground source={headerBg} style={styles.header}>
          <View style={styles.headerOverlay}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#0D2A94" />
            </TouchableOpacity>
          </View>
        </ImageBackground>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Check Registration Status</Text>
          <Text style={styles.subtitle}>
            Enter your details to check your registration status.
          </Text>
          {!status && (
            <View style={styles.form}>
              <Text style={styles.label}>Email Address:</Text>
              <TextInput
                style={styles.input}
                placeholder="email@example.com"
                placeholderTextColor="#A9A9A9"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
              <Text style={styles.label}>Last Name:</Text>
              <TextInput
                style={styles.input}
                placeholder="Dela Cruz"
                placeholderTextColor="#A9A9A9"
                value={lastName}
                onChangeText={setLastName}
              />
              {error ? (
                <View style={styles.errorBanner}>
                  <Ionicons name="alert-circle" size={18} color="#c0392b" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <TouchableOpacity
                style={[styles.checkBtn, loading && { opacity: 0.7 }]}
                onPress={handleCheckStatus}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.checkBtnText}>Check Status</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {renderStatus()}

          {status && (
            <TouchableOpacity
              style={styles.checkAgainBtn}
              onPress={() => {
                setStatus(null);
                setEmail("");
                setLastName("");
                setError("");
              }}
            >
              <Text style={styles.checkAgainText}>Check Another</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  header: { width: "100%", height: 200 },
  headerOverlay: { flex: 1, backgroundColor: "rgba(255,255,255,0.1)" },
  backBtn: {
    marginTop: 20,
    marginLeft: 20,
    backgroundColor: "white",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  content: {
    paddingHorizontal: 30,
    paddingTop: 30,
    paddingBottom: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0D2A94",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 30,
  },
  form: { width: "100%" },
  label: {
    fontWeight: "bold",
    color: "#555",
    marginBottom: 5,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#CCC",
    paddingVertical: 8,
    marginBottom: 20,
    fontSize: 16,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff5f5",
    borderWidth: 1,
    borderColor: "#e74c3c",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    gap: 8,
  },
  errorText: { color: "#c0392b", fontSize: 13, flex: 1 },
  checkBtn: {
    backgroundColor: "#0D2A94",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  checkBtnText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  statusCard: {
    width: "100%",
    padding: 25,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
  },
  pendingCard: {
    backgroundColor: "#fffbf0",
    borderWidth: 1,
    borderColor: "#FFB800",
  },
  approvedCard: {
    backgroundColor: "#f0fff4",
    borderWidth: 1,
    borderColor: "#27ae60",
  },
  rejectedCard: {
    backgroundColor: "#fff5f5",
    borderWidth: 1,
    borderColor: "#e74c3c",
  },
  statusTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 8,
  },
  statusDot: { width: 14, height: 14, borderRadius: 7 },
  statusTitle: { fontSize: 22, fontWeight: "bold", color: "#333" },
  statusName: { fontSize: 16, fontWeight: "600", color: "#555", marginTop: 5 },
  statusMessage: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    marginTop: 10,
    lineHeight: 20,
  },
  setupBtn: {
    backgroundColor: "#0D2A94",
    padding: 14,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  setupBtnText: { color: "white", fontWeight: "bold", fontSize: 15 },
  notesBox: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e74c3c",
    borderRadius: 8,
    padding: 12,
    marginTop: 15,
    width: "100%",
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#e74c3c",
    marginBottom: 4,
  },
  notesText: { fontSize: 13, color: "#333", lineHeight: 18 },
  checkAgainBtn: { alignItems: "center", marginTop: 25 },
  checkAgainText: {
    color: "#0D2A94",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});
