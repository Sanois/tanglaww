import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ScanQRScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={26} color="#2F459B" />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.headerTitle}>Scan QR</Text>
        <Text style={styles.headerSubtitle}>
          Point your camera at the QR code to proceed
        </Text>

        <View style={styles.scannerOutline}>
          <View style={styles.qrBox}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />

            <Ionicons name="qr-code" size={150} color="#111" />
          </View>
        </View>

        <View style={styles.stepsContainer}>
          <Text style={styles.stepsTitle}>Steps:</Text>

          <View style={styles.stepRow}>
            <Text style={styles.stepNum}>1.</Text>
            <Text style={styles.stepText}>
              Sign in to your account on any device where you’re already logged
              in.
            </Text>
          </View>

          <View style={styles.stepRow}>
            <Text style={styles.stepNum}>2.</Text>
            <Text style={styles.stepText}>
              Go to your <Text style={styles.bold}>Profile Page</Text> and tap
              the <Text style={styles.bold}>QR icon</Text> at the top right
              corner.
            </Text>
          </View>

          <View style={styles.stepRow}>
            <Text style={styles.stepNum}>3.</Text>
            <Text style={styles.stepText}>
              Select the <Text style={styles.bold}>“My QR”</Text> tab to view
              your personal code and point your camera at the code.
            </Text>
          </View>

          <View style={styles.stepRow}>
            <Text style={styles.stepNum}>4.</Text>
            <Text style={styles.stepText}>
              Once scanned, you’ll be automatically logged in and ready to
              continue.
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  backButton: { padding: 20 },
  content: { alignItems: "center", paddingHorizontal: 35 },
  headerTitle: { fontSize: 30, fontWeight: "bold", color: "#2F459B" },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    marginBottom: 40,
  },

  scannerOutline: {
    width: 260,
    height: 260,
    backgroundColor: "#fff",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    marginBottom: 40,
  },
  qrBox: {
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  corner: {
    position: "absolute",
    width: 35,
    height: 35,
    borderColor: "#4A90E2",
    borderWidth: 3,
  },
  topLeft: { top: -10, left: -10, borderRightWidth: 0, borderBottomWidth: 0 },
  topRight: { top: -10, right: -10, borderLeftWidth: 0, borderBottomWidth: 0 },
  bottomLeft: {
    bottom: -10,
    left: -10,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: -10,
    right: -10,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },

  stepsContainer: { alignSelf: "flex-start", width: "100%" },
  stepsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#444",
    marginBottom: 15,
  },
  stepRow: { flexDirection: "row", marginBottom: 15 },
  stepNum: { fontSize: 14, color: "#888", marginRight: 8, width: 20 },
  stepText: { fontSize: 14, color: "#888", flex: 1, lineHeight: 20 },
  bold: { fontWeight: "700", color: "#666" },
});
