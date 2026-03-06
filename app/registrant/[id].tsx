import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function RegistrantDetails() {
  const { id } = useLocalSearchParams(); 
  const router = useRouter();
  const [remarks, setRemarks] = useState("");
  const [showRemarks, setShowRemarks] = useState(false);

  const displayName = typeof id === 'string' 
    ? id.replace(/-/g, ' ').toUpperCase() 
    : "REGISTRANT";

  const InfoRow = ({ title, isDocument = false }: { title: string; isDocument?: boolean }) => (
    <TouchableOpacity style={styles.infoRow}>
      <Text style={styles.infoRowText}>{title}</Text>
      <Ionicons name={isDocument ? "chevron-forward" : "chevron-down"} size={20} color="#555" />
    </TouchableOpacity>
  );

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
          <Text style={styles.registrantSub}>Bachelor of Elementary Education</Text>
        </View>

        <Text style={styles.sectionLabel}>Registrant Information:</Text>
        <InfoRow title="Program & Curriculum" />
        <InfoRow title="Personal Information" />
        <InfoRow title="Promotions & Verification" />
        <InfoRow title="Payment information" />

        <Text style={[styles.sectionLabel, { marginTop: 20 }]}>Documents:</Text>
        <InfoRow title="Identity verification document" isDocument />
        <InfoRow title="Proof of payment" isDocument />

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.approveBtn}>
            <Text style={styles.buttonText}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.rejectBtn} onPress={() => setShowRemarks(true)}>
            <Text style={styles.buttonText}>Reject</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => setShowRemarks(!showRemarks)}>
          <Text style={styles.remarksLink}>Remarks</Text>
        </TouchableOpacity>

        {showRemarks && (
          <TextInput
            style={styles.remarksInput}
            placeholder="Enter reason for rejection..."
            value={remarks}
            onChangeText={setRemarks}
            multiline
          />
        )}
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  header: { backgroundColor: "#FFD75E", flexDirection: "row", alignItems: "center", padding: 15 },
  headerTitle: { fontSize: 20, fontWeight: "bold", marginLeft: 20 },
  content: { padding: 20 },
  profileSection: { alignItems: "center", marginBottom: 25 },
  avatarLarge: { width: 100, height: 100, borderRadius: 50, backgroundColor: "#F0F0F0", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#CCC", marginBottom: 10 },
  registrantName: { fontSize: 18, fontWeight: "bold", color: "#2F459B" },
  registrantSub: { fontSize: 13, color: "#555", fontStyle: "italic" },
  sectionLabel: { fontSize: 14, fontWeight: "bold", color: "#2F459B", marginBottom: 10 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 15, borderWidth: 1, borderColor: "black", borderRadius: 8, marginBottom: 10 },
  infoRowText: { fontSize: 14, fontWeight: "500" },
  buttonRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 30 },
  approveBtn: { backgroundColor: "#00FF00", width: "48%", padding: 12, borderRadius: 8, alignItems: "center" },
  rejectBtn: { backgroundColor: "#FF5252", width: "48%", padding: 12, borderRadius: 8, alignItems: "center" },
  buttonText: { fontWeight: "bold", color: "black" },
  remarksLink: { color: "#2F459B", fontWeight: "bold", marginTop: 15, textDecorationLine: "underline" },
  remarksInput: { borderWidth: 1, borderColor: "#CCC", borderRadius: 8, padding: 10, marginTop: 10, height: 80, textAlignVertical: 'top' }
});