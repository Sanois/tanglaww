import { useAdmin } from "@/context/AdminContext";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  Linking,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { height } = Dimensions.get("window");

export default function RegistrantDetails() {
  const { id, name } = useLocalSearchParams();
  const router = useRouter();
  const { refreshData } = useAdmin();

  const [remarks, setRemarks] = useState("");
  const [showRemarks, setShowRemarks] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [paymentPreview, setPaymentPreview] = useState(false);
  const slideAnimation = useState(new Animated.Value(height))[0];

  const displayName =
    typeof name === "string" ? name.toUpperCase() : "REGISTRANT";

  useEffect(() => {
    fetchEnrollmentDetails();
  }, [id]);

  const fetchEnrollmentDetails = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("enrollment")
      .select(
        `
                enrollment_id,
                student (
                    firstName, lastName, middleName,
                    email, bachelorsDegree, lastSchoolAttended,
                    province, profilephotourl
                ),
                curriculum!enrollment_curriculum_id_fkey (curriculumName),
                specialization!enrollment_specialization_id_fkey (specializationName),
                type_of_taker!enrollment_typeOfTaker_id_fkey (typeOfTaker),
                promo!enrollment_promo_id_fkey (promo),
                verification!enrollment_verification_id_fkey (
                    verification_id, verificationStatus, verificationNotes
                ),
                paymentDetails (
                    amountTransferred, referenceNumber,
                    proofOfPaymentUrl,
                    payment_channel!paymentDetails_paymentChannel_id_fkey (paymentChannelName)
                )
            `,
      )
      .eq("enrollment_id", id)
      .single();

    if (error) {
      console.error("Fetch error:", error.message);
      setLoading(false);
      return;
    }

    setEnrollment(data);
    setLoading(false);
  };

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const InfoRow = ({
    sectionKey,
    title,
    children,
    isDocument = false,
    url,
  }: {
    sectionKey: string;
    title: string;
    children?: React.ReactNode;
    isDocument?: boolean;
    url?: string;
  }) => {
    const isOpen = openSection === sectionKey;
    return (
      <View>
        <TouchableOpacity
          style={styles.infoRow}
          onPress={() => {
            if (isDocument && url) Linking.openURL(url);
            else toggleSection(sectionKey);
          }}
        >
          <Text style={styles.infoRowText}>{title}</Text>
          <Ionicons
            name={
              isDocument
                ? "chevron-forward"
                : isOpen
                  ? "chevron-up"
                  : "chevron-down"
            }
            size={20}
            color="#555"
          />
        </TouchableOpacity>
        {isOpen && !isDocument && (
          <View style={styles.expandedSection}>{children}</View>
        )}
      </View>
    );
  };

  const openSheet = () => {
    setPaymentPreview(true);
    Animated.spring(slideAnimation, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 4,
    }).start();
  };

  const closeSheet = () => {
    Animated.timing(slideAnimation, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setPaymentPreview(false));
  };

  const DetailRow = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value || "—"}</Text>
    </View>
  );

  const handleApprove = () => {
    Alert.alert(
      "Approve Enrollment",
      `Approve ${enrollment.student.firstName} ${enrollment.student.lastName}? An activation code will be sent to their email.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Approve",
          onPress: async () => {
            const v = Array.isArray(enrollment.verification)
              ? enrollment.verification[0]
              : enrollment.verification;

            const { error } = await supabase
              .from("verification")
              .update({
                verificationStatus: true,
                lastVerificationDate: new Date().toISOString(),
              })
              .eq("verification_id", v?.verification_id);

            if (error) {
              Alert.alert("Error", error.message);
              return;
            }
            await refreshData();
            Alert.alert("Approved!", "Enrollment has been approved.");
            router.back();
          },
        },
      ],
    );
  };

  const handleReject = () => {
    if (!remarks.trim()) {
      Alert.alert("Remarks required", "Please enter a reason for rejection.");
      return;
    }

    Alert.alert("Reject Enrollment", `Reject ${displayName}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reject",
        style: "destructive",
        onPress: async () => {
          const v = Array.isArray(enrollment.verification)
            ? enrollment.verification[0]
            : enrollment.verification;

          const { error } = await supabase
            .from("verification")
            .update({
              verificationStatus: false,
              verificationNotes: remarks,
              lastVerificationDate: new Date().toISOString(),
            })
            .eq("verification_id", v?.verification_id);

          if (error) {
            Alert.alert("Error", error.message);
            return;
          }
          await refreshData();
          Alert.alert("Rejected.", "Enrollment has been rejected.");
          router.back();
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#2F459B" style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  const student = enrollment?.student;
  const payment = Array.isArray(enrollment?.paymentDetails)
    ? enrollment.paymentDetails[0]
    : enrollment?.paymentDetails;
  const proofUrl = payment?.proofOfPaymentUrl;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pending</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.profileSection}>
          <View style={styles.avatarLarge}>
            <Ionicons name="person-outline" size={50} color="#555" />
          </View>
          <Text style={styles.registrantName}>{displayName}</Text>
          <Text style={styles.registrantSub}>
            {enrollment?.curriculum?.curriculumName ?? "—"}
          </Text>
        </View>

        <Text style={styles.sectionLabel}>Registrant Information:</Text>

        <InfoRow sectionKey="program" title="Program & Curriculum">
          <DetailRow
            label="Curriculum"
            value={enrollment?.curriculum?.curriculumName}
          />
          <DetailRow
            label="Specialization"
            value={enrollment?.specialization?.specializationName}
          />
          <DetailRow
            label="Type of Taker"
            value={enrollment?.type_of_taker?.typeOfTaker}
          />
        </InfoRow>

        <InfoRow sectionKey="personal" title="Personal Information">
          <DetailRow label="First Name" value={student?.firstName} />
          <DetailRow label="Middle Name" value={student?.middleName} />
          <DetailRow label="Last Name" value={student?.lastName} />
          <DetailRow label="Email" value={student?.email} />
          <DetailRow label="Degree" value={student?.bachelorsDegree} />
          <DetailRow label="Last School" value={student?.lastSchoolAttended} />
          <DetailRow label="Province" value={student?.province} />
        </InfoRow>

        <InfoRow sectionKey="promo" title="Promotions & Verification">
          <DetailRow label="Promo" value={enrollment?.promo?.promo ?? "None"} />
        </InfoRow>

        <InfoRow sectionKey="payment" title="Payment Information">
          <DetailRow
            label="Channel"
            value={payment?.payment_channel?.paymentChannelName}
          />
          <DetailRow
            label="Amount"
            value={payment?.amountTransferred?.toString()}
          />
          <DetailRow label="Reference #" value={payment?.referenceNumber} />
        </InfoRow>

        <Text style={[styles.sectionLabel, { marginTop: 20 }]}>Documents:</Text>

        <TouchableOpacity
          style={styles.infoRow}
          onPress={() => {
            if (!proofUrl) {
              Alert.alert("No proof of payment uploaded.");
              return;
            }
            if (proofUrl.endsWith(".pdf")) {
              WebBrowser.openBrowserAsync(proofUrl);
            } else {
              openSheet();
            }
          }}
        >
          <Text style={styles.infoRowText}>Proof of Payment</Text>
          <Ionicons name="chevron-forward" size={20} color="#555" />
        </TouchableOpacity>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.approveBtn} onPress={handleApprove}>
            <Text style={styles.buttonText}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.rejectBtn}
            onPress={() => setShowRemarks(!showRemarks)}
          >
            <Text style={styles.buttonText}>Reject</Text>
          </TouchableOpacity>
        </View>

        {showRemarks && (
          <>
            <TextInput
              style={styles.remarksInput}
              placeholder="Enter reason for rejection..."
              value={remarks}
              onChangeText={setRemarks}
              multiline
            />
            <TouchableOpacity
              style={styles.confirmRejectBtn}
              onPress={handleReject}
            >
              <Text style={styles.buttonText}>Confirm Rejection</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
      <Modal
        visible={paymentPreview}
        transparent
        animationType="none"
        onRequestClose={closeSheet}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={closeSheet}
        />

        <Animated.View
          style={[
            styles.bottomSheet,
            { transform: [{ translateY: slideAnimation }] },
          ]}
        >
          <View style={styles.sheetHandle} />

          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Proof of Payment</Text>
            <TouchableOpacity onPress={closeSheet}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {proofUrl ? (
            <Image
              source={{ uri: proofUrl }}
              style={styles.proofImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.noProofContainer}>
              <Ionicons name="image-outline" size={50} color="#ccc" />
              <Text style={styles.noProofText}>
                No proof of payment uploaded
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.openBrowserBtn}
            onPress={() => proofUrl && WebBrowser.openBrowserAsync(proofUrl)}
          >
            <Ionicons name="open-outline" size={18} color="white" />
            <Text style={styles.openBrowserText}>Open Full Size</Text>
          </TouchableOpacity>
        </Animated.View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  header: {
    backgroundColor: "#FFD75E",
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", marginLeft: 20 },
  content: { padding: 20 },
  profileSection: { alignItems: "center", marginBottom: 25 },
  avatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CCC",
    marginBottom: 10,
  },
  registrantName: { fontSize: 18, fontWeight: "bold", color: "#2F459B" },
  registrantSub: { fontSize: 13, color: "#555", fontStyle: "italic" },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2F459B",
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 8,
    marginBottom: 10,
  },
  infoRowText: { fontSize: 14, fontWeight: "500" },
  expandedSection: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    marginTop: -5,
  },
  detailRow: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  detailLabel: {
    fontSize: 11,
    color: "#2F459B",
    fontWeight: "700",
    marginBottom: 2,
  },
  detailValue: { fontSize: 13, color: "#333" },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
  },
  approveBtn: {
    backgroundColor: "#27ae60",
    width: "48%",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  rejectBtn: {
    backgroundColor: "#e74c3c",
    width: "48%",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { fontWeight: "bold", color: "white" },
  remarksLink: {
    color: "#2F459B",
    fontWeight: "bold",
    marginTop: 15,
    textDecorationLine: "underline",
  },
  remarksInput: {
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    height: 80,
    textAlignVertical: "top",
  },
  confirmRejectBtn: {
    backgroundColor: "#e74c3c",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
    maxHeight: height * 0.75,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#ddd",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 15,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2F459B",
  },
  proofImage: {
    width: "100%",
    height: 350,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  noProofContainer: {
    alignItems: "center",
    padding: 40,
  },
  noProofText: {
    color: "#999",
    marginTop: 10,
    fontSize: 13,
  },
  openBrowserBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2F459B",
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
    gap: 8,
  },
  openBrowserText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
});
