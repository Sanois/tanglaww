import { useAdmin } from "@/context/AdminContext";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Enrollment {
  enrollment_id: number;
  student_id: number;
  student: {
    firstName: string;
    lastName: string;
    email: string;
  };
  curriculum: {
    curriculumName: string;
  };
  verification: {
    verificationStatus: boolean;
    verification_id: number;
  } | null;
}

export default function AdminApproval() {
  const router = useRouter();
  const { auditRequests, loading, refreshData } = useAdmin();

  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const onRefresh = () => {
    setRefreshing(true);
    refreshData().then(() => setRefreshing(false));
  };

  const pending = auditRequests.filter((e: any) => {
    const v = Array.isArray(e.verification)
      ? e.verification[0]
      : e.verification;
    return v?.verificationStatus === false;
  });

  const approved = auditRequests.filter((e: any) => {
    const v = Array.isArray(e.verification)
      ? e.verification[0]
      : e.verification;
    return v?.verificationStatus === true;
  });

  const handleApprove = async (enrollment: Enrollment) => {
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

              Alert.alert("Approved");
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

  const ApprovalCard = ({
    enrollment,
    showActions,
  }: {
    enrollment: Enrollment;
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

      {showActions && actionLoading === enrollment.enrollment_id ? (
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
        <Ionicons name="chevron-forward" size={20} color="#CCC" />
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
});
