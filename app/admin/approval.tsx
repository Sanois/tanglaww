import { useAdmin } from "@/context/AdminContext";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const generateCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendActivationEmail = async (
  to: string,
  studentName: string,
  code: string,
): Promise<boolean> => {
  try {
    const response = await fetch(
      "https://ohqzmjlerxudlhggxqnn.supabase.co/functions/v1/send-activation-email",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!}`,
        },
        body: JSON.stringify({ to, studentName, code }),
      },
    );

    console.log("Response status:", response.status);
    console.log("Response content-type:", response.headers.get("content-type"));

    const text = await response.text();
    console.log("Raw response:", text);

    const data = JSON.parse(text);
    return data?.success === true;
  } catch (err) {
    console.error("Email send error:", err);
    return false;
  }
};

export default function AdminApproval() {
  const router = useRouter();
  const { auditRequests, loading, refreshData } = useAdmin();

  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const [codeModal, setCodeModal] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [emailSent, setEmailSent] = useState<boolean | null>(null);
  const [codeStudent, setCodeStudent] = useState<{
    name: string;
    email: string;
  } | null>(null);

  const onRefresh = () => {
    setRefreshing(true);
    refreshData().then(() => setRefreshing(false));
  };

  const pending = auditRequests.filter((e: any) => {
    const v = Array.isArray(e.verification)
      ? e.verification[0]
      : e.verification;
    return v?.verificationStatus === false && !v?.verificationNotes;
  });

  const approved = auditRequests.filter((e: any) => {
    const v = Array.isArray(e.verification)
      ? e.verification[0]
      : e.verification;
    return v?.verificationStatus === true;
  });

  const handleApprove = async (enrollment: any) => {
    console.log("handleApprove called");
    console.log("Full enrollment object:", JSON.stringify(enrollment, null, 2));
    console.log("enrollment:", JSON.stringify(enrollment, null, 2));
    Alert.alert(
      "Approve Enrollment",
      `Approve ${enrollment.student.firstName} ${enrollment.student.lastName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Approve",
          onPress: async () => {
            setActionLoading(enrollment.enrollment_id);
            try {
              const v = Array.isArray(enrollment.verification)
                ? enrollment.verification[0]
                : enrollment.verification;

              const { error: verifyError } = await supabase
                .from("verification")
                .update({
                  verificationStatus: true,
                  lastVerificationDate: new Date().toISOString(),
                })
                .eq("verification_id", v?.verification_id);

              if (verifyError) throw new Error(verifyError.message);

              console.log("Verification updated, generating code...");
              console.log("enrollment_id:", enrollment.enrollment_id);
              console.log("student_id:", enrollment.student_id);

              const { data: existingCode, error: existingError } =
                await supabase
                  .from("activation_codes")
                  .select("code")
                  .eq("enrollment_id", enrollment.enrollment_id)
                  .eq("is_used", false)
                  .gt("expires_at", new Date().toISOString())
                  .maybeSingle();

              console.log("existingCode:", existingCode);
              console.log("existingError:", existingError);

              let code: string;

              if (existingCode) {
                code = existingCode.code;
              } else {
                code = generateCode();

                const expiresAt = new Date();
                expiresAt.setDate(expiresAt.getDate() + 7);

                const { error: codeError } = await supabase
                  .from("activation_codes")
                  .insert({
                    code,
                    student_id: enrollment.student_id,
                    enrollment_id: enrollment.enrollment_id,
                    is_used: false,
                    expires_at: expiresAt.toISOString(),
                  });
                console.log("codeError:", codeError);

                if (codeError) throw new Error(codeError.message);
              }

              const studentName = `${enrollment.student.firstName} ${enrollment.student.lastName}`;
              const sent = await sendActivationEmail(
                enrollment.student.email,
                enrollment.student.firstName,
                code,
              );

              setGeneratedCode(code);
              setEmailSent(sent);
              setCodeStudent({
                name: studentName,
                email: enrollment.student.email,
              });
              setCodeModal(true);

              await refreshData();
            } catch (err: any) {
              console.error("handleApprove full error:", err);
              console.error("handleApprove message:", err.message);
              Alert.alert("Error", err.message ?? "Something went wrong.");
            } finally {
              setActionLoading(null);
            }
          },
        },
      ],
    );
  };

  const handleReject = async (enrollment: any) => {
    Alert.alert(
      "Reject Enrollment",
      `Reject ${enrollment.student.firstName} ${enrollment.student.lastName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reject",
          style: "destructive",
          onPress: async () => {
            setActionLoading(enrollment.enrollment_id);
            try {
              const v = Array.isArray(enrollment.verification)
                ? enrollment.verification[0]
                : enrollment.verification;

              const { error } = await supabase
                .from("verification")
                .update({
                  verificationStatus: false,
                  verificationNotes: "Application rejected by administrator.",
                  lastVerificationDate: new Date().toISOString(),
                })
                .eq("verification_id", v?.verification_id);

              if (error) throw new Error(error.message);
              await refreshData();
            } catch (err: any) {
              Alert.alert("Error", err.message ?? "Something went wrong.");
            } finally {
              setActionLoading(null);
            }
          },
        },
      ],
    );
  };

  const handleViewCode = async (enrollment: any) => {
    const { data } = await supabase
      .from("activation_codes")
      .select("code, is_used, expires_at")
      .eq("enrollment_id", enrollment.enrollment_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!data) {
      Alert.alert("No Code", "No activation code found for this student.");
      return;
    }

    if (data.is_used) {
      Alert.alert(
        "Account Activated",
        "This student has already activated their account.",
      );
      return;
    }

    if (new Date(data.expires_at) < new Date()) {
      Alert.alert(
        "Code Expired",
        "The activation code has expired. Tap Approve again to generate a new one.",
      );
      return;
    }

    setGeneratedCode(data.code);
    setEmailSent(null);
    setCodeStudent({
      name: `${enrollment.student.firstName} ${enrollment.student.lastName}`,
      email: enrollment.student.email,
    });
    setCodeModal(true);
  };

  const handleResendEmail = async () => {
    if (!codeStudent) return;
    const sent = await sendActivationEmail(
      codeStudent.email,
      codeStudent.name.split(" ")[0],
      generatedCode,
    );
    setEmailSent(sent);
    Alert.alert(
      sent ? "Email Sent" : "Email Failed",
      sent
        ? `Activation code resent to ${codeStudent.email}`
        : "Could not send email. Please share the code manually.",
    );
  };

  const ApprovalCard = ({
    enrollment,
    showActions,
  }: {
    enrollment: any;
    showActions: boolean;
  }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        router.push(
          `/admin/registrant/${enrollment.enrollment_id}?name=${enrollment.student.firstName}+${enrollment.student.lastName}` as any,
        )
      }
    >
      <View style={styles.avatarCircle}>
        <Ionicons name="person-outline" size={20} color="#555" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.nameText}>
          {enrollment.student.firstName} {enrollment.student.lastName}
        </Text>
        <Text style={styles.courseText}>
          {enrollment.curriculum?.curriculumName ?? "—"}
        </Text>
      </View>

      {actionLoading === enrollment.enrollment_id ? (
        <ActivityIndicator size="small" color="#2F459B" />
      ) : showActions ? (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.approveBtn}
            onPress={() => handleApprove(enrollment)}
          >
            <Ionicons name="checkmark" size={18} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.rejectBtn}
            onPress={() => handleReject(enrollment)}
          >
            <Ionicons name="close" size={18} color="white" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.codeBtn}
          onPress={() => handleViewCode(enrollment)}
        >
          <Ionicons name="key-outline" size={16} color="#2F459B" />
          <Text style={styles.codeBtnText}>Code</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="menu" size={28} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Approvals</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2F459B" style={{ flex: 1 }} />
      ) : (
        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <Text style={styles.sectionTitle}>Pending ({pending.length})</Text>
          {pending.length === 0 ? (
            <Text style={styles.emptyText}>No pending enrollments</Text>
          ) : (
            pending.map((e) => (
              <ApprovalCard
                key={e.enrollment_id}
                enrollment={e}
                showActions={true}
              />
            ))
          )}

          <Text style={styles.sectionTitle}>Approved ({approved.length})</Text>
          {approved.length === 0 ? (
            <Text style={styles.emptyText}>No approved enrollments</Text>
          ) : (
            approved.map((e) => (
              <ApprovalCard
                key={e.enrollment_id}
                enrollment={e}
                showActions={false}
              />
            ))
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      <Modal visible={codeModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Ionicons name="checkmark-circle" size={40} color="#27ae60" />
              <Text style={styles.modalTitle}>Student Approved!</Text>
            </View>

            <Text style={styles.modalSubtitle}>Activation code for:</Text>
            <Text style={styles.modalStudentName}>{codeStudent?.name}</Text>
            <Text style={styles.modalEmail}>{codeStudent?.email}</Text>

            {emailSent === true && (
              <View style={styles.emailSuccessBanner}>
                <Ionicons name="mail" size={16} color="#27ae60" />
                <Text style={styles.emailSuccessText}>
                  Email sent successfully to student
                </Text>
              </View>
            )}
            {emailSent === false && (
              <View style={styles.emailFailBanner}>
                <Ionicons name="mail-unread" size={16} color="#E74C3C" />
                <Text style={styles.emailFailText}>
                  Email failed — share code manually
                </Text>
              </View>
            )}

            <View style={styles.codeDisplay}>
              {generatedCode.split("").map((digit, i) => (
                <View key={i} style={styles.codeDigitBox}>
                  <Text style={styles.codeDigit}>{digit}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.codeExpiry}>
              Expires in 7 days · One-time use only
            </Text>

            <TouchableOpacity
              style={styles.resendBtn}
              onPress={handleResendEmail}
            >
              <Ionicons name="send-outline" size={16} color="#2F459B" />
              <Text style={styles.resendBtnText}>Resend Email</Text>
            </TouchableOpacity>

            <Text style={styles.codeInstruction}>
              If the student doesn't receive the email, share the code above
              directly via SMS or messaging app.
            </Text>

            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => {
                setCodeModal(false);
                setEmailSent(null);
              }}
            >
              <Text style={styles.modalCloseBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push("/admin/dashboard" as any)}
        >
          <Ionicons name="home-outline" size={24} color="#2F459B" />
          <Text style={styles.tabLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="person" size={24} color="#FFD75E" />
          <Text style={[styles.tabLabel, { color: "#FFD75E" }]}>Approvals</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push("/admin/calendar" as any)}
        >
          <Ionicons name="calendar-outline" size={24} color="#2F459B" />
          <Text style={styles.tabLabel}>Calendar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push("/admin/courses" as any)}
        >
          <Ionicons name="school-outline" size={24} color="#2F459B" />
          <Text style={styles.tabLabel}>Courses</Text>
        </TouchableOpacity>
      </View>
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
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "black",
    marginLeft: 20,
  },
  content: { paddingHorizontal: 20, paddingTop: 10 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2F459B",
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    color: "#999",
    fontSize: 13,
    marginBottom: 10,
    fontStyle: "italic",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2F459B",
    marginBottom: 10,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CCC",
  },
  textContainer: { flex: 1, marginLeft: 15 },
  nameText: { fontSize: 15, fontWeight: "bold", color: "#2F459B" },
  courseText: { fontSize: 12, color: "#777" },
  actionRow: { flexDirection: "row", gap: 8 },
  approveBtn: {
    backgroundColor: "#27ae60",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  rejectBtn: {
    backgroundColor: "#e74c3c",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  codeBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2F459B",
    gap: 4,
  },
  codeBtnText: { fontSize: 12, color: "#2F459B", fontWeight: "600" },
  tabBar: {
    position: "absolute",
    bottom: 0,
    flexDirection: "row",
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#EEE",
    paddingVertical: 10,
    width: "100%",
  },
  tabItem: { flex: 1, alignItems: "center" },
  tabLabel: { fontSize: 10, marginTop: 4, color: "#2F459B" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    alignItems: "center",
  },
  modalHeader: { alignItems: "center", marginBottom: 12 },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#27ae60",
    marginTop: 8,
  },
  modalSubtitle: { fontSize: 12, color: "#777", marginBottom: 4 },
  modalStudentName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0D2A94",
    marginBottom: 2,
  },
  modalEmail: { fontSize: 12, color: "#777", marginBottom: 12 },

  emailSuccessBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fff4",
    borderWidth: 1,
    borderColor: "#27ae60",
    borderRadius: 8,
    padding: 10,
    gap: 8,
    marginBottom: 12,
    width: "100%",
  },
  emailSuccessText: { fontSize: 12, color: "#27ae60", fontWeight: "600" },
  emailFailBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff5f5",
    borderWidth: 1,
    borderColor: "#E74C3C",
    borderRadius: 8,
    padding: 10,
    gap: 8,
    marginBottom: 12,
    width: "100%",
  },
  emailFailText: { fontSize: 12, color: "#E74C3C", fontWeight: "600" },

  codeDisplay: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  codeDigitBox: {
    width: 40,
    height: 50,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#0D2A94",
    backgroundColor: "#F0F4FF",
    justifyContent: "center",
    alignItems: "center",
  },
  codeDigit: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0D2A94",
  },
  codeExpiry: {
    fontSize: 11,
    color: "#E74C3C",
    marginBottom: 12,
    fontStyle: "italic",
  },
  resendBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2F459B",
    gap: 6,
    marginBottom: 12,
  },
  resendBtnText: { fontSize: 13, color: "#2F459B", fontWeight: "600" },
  codeInstruction: {
    fontSize: 11,
    color: "#777",
    textAlign: "center",
    lineHeight: 16,
    marginBottom: 16,
  },
  modalCloseBtn: {
    backgroundColor: "#0D2A94",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  modalCloseBtnText: { color: "white", fontWeight: "bold", fontSize: 15 },
});
