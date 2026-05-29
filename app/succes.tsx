import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAdmin } from "../context/AdminContext";

export default function SuccessScreen() {
  const router = useRouter();
  const { currentStudentId } = useAdmin();

  useEffect(() => {
    if (currentStudentId) {
      const timer = setTimeout(() => {
        router.replace("/homepage" as any);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [currentStudentId]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-sharp" size={100} color="white" />
        </View>

        {}
        <Text style={styles.title}>
          Your account has been successfully activated!
        </Text>
        <Text style={styles.subtitle}>Welcome aboard, Achiever!</Text>
      </View>

      {}
      <View style={styles.footer}>
        <ActivityIndicator color="#0D2A94" style={{ marginTop: 20 }} />
        <Text style={styles.loadingText}>Setting up your dashboard...</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#4CD964",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0D2A94",
    textAlign: "center",
    lineHeight: 32,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  footer: {
    padding: 30,
    paddingBottom: 50,
  },
  continueBtn: {
    backgroundColor: "#0D2A94",
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
  },
  continueText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  loadingText: {
    fontSize: 15,
    color: "#777",
    textAlign: "center",
  },
});
