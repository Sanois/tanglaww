import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../lib/supabase";

const { width } = Dimensions.get("window");
const headerBg = require("../assets/images/llpt.jpg");

export default function EnrollmentCodeScreen() {
  const router = useRouter();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputs = useRef<TextInput[]>([]);

  const isCodeComplete = code.every((digit) => digit !== "");
  const fullCode = code.join("");

  const handleTextChange = (text: string, index: number) => {
    const clean = text.replace(/[^0-9]/g, "");
    const newCode = [...code];
    newCode[index] = clean;
    setCode(newCode);
    setError("");

    if (clean && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    if (!isCodeComplete) return;
    setLoading(true);
    setError("");

    try {
      const { data: codeData, error: codeError } = await supabase
        .from("activation_codes")
        .select("id, student_id, enrollment_id, is_used, expires_at")
        .eq("code", fullCode)
        .maybeSingle();

      if (codeError) throw new Error(codeError.message);

      if (!codeData) {
        setError("Invalid code. Please check and try again.");
        setLoading(false);
        return;
      }

      if (codeData.is_used) {
        setError(
          "This code has already been used. Please contact the admin if you need help.",
        );
        setLoading(false);
        return;
      }

      if (new Date(codeData.expires_at) < new Date()) {
        setError(
          "This code has expired. Please contact the admin for a new one.",
        );
        setLoading(false);
        return;
      }

      const { data: student, error: studentError } = await supabase
        .from("student")
        .select("id, email, isAccountSetup")
        .eq("id", codeData.student_id)
        .single();

      if (studentError || !student) {
        setError("Student record not found. Please contact the admin.");
        setLoading(false);
        return;
      }

      if (student.isAccountSetup) {
        setError(
          "This account has already been activated. Please log in instead.",
        );
        setLoading(false);
        return;
      }

      router.push({
        pathname: "/profilesetup",
        params: {
          email: student.email,
          studentId: String(student.id),
          activationCodeId: String(codeData.id),
        },
      } as any);
    } catch (err: any) {
      setError(err.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
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

        <View style={styles.content}>
          <Text style={styles.title}>Activate your Account</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code provided by your administrator.
          </Text>

          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Enter Activation Code</Text>

            <View style={styles.codeContainer}>
              {code.map((digit, index) => (
                <View
                  key={index}
                  style={[
                    styles.codeBox,
                    {
                      borderColor: error
                        ? "#E74C3C"
                        : digit
                          ? "#0D2A94"
                          : "#BDC3C7",
                    },
                  ]}
                >
                  <TextInput
                    ref={(el) => {
                      if (el) inputs.current[index] = el;
                    }}
                    style={styles.codeInput}
                    maxLength={1}
                    keyboardType="number-pad"
                    onChangeText={(text) => handleTextChange(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    value={digit}
                    placeholder="•"
                    placeholderTextColor="#BDC3C7"
                    selectionColor="#0D2A94"
                  />
                </View>
              ))}
            </View>

            {error ? (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={16} color="#E74C3C" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : (
              <View style={styles.hintContainer}>
                <Ionicons name="bulb-outline" size={16} color="#FFB800" />
                <Text style={styles.hintText}>
                  Contact your administrator if you haven't received your code.
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.continueBtn,
              { opacity: isCodeComplete && !loading ? 1 : 0.6 },
            ]}
            onPress={handleVerify}
            disabled={!isCodeComplete || loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text style={styles.continueText}>Verify Code</Text>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color="white"
                  style={{ marginLeft: 5 }}
                />
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  header: { width: "100%", height: 200 },
  headerOverlay: { flex: 1, backgroundColor: "rgba(13, 42, 148, 0.1)" },
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    alignItems: "center",
    marginTop: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0D2A94",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 40,
  },
  inputSection: { width: "100%" },
  inputLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0D2A94",
    marginBottom: 20,
  },
  codeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  codeBox: {
    width: (width - 100) / 6,
    height: 55,
    borderWidth: 2,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  codeInput: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0D2A94",
    textAlign: "center",
    width: "100%",
  },
  hintContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 6,
  },
  hintText: {
    fontSize: 11,
    color: "#666",
    fontStyle: "italic",
    flex: 1,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff5f5",
    borderWidth: 1,
    borderColor: "#E74C3C",
    borderRadius: 8,
    padding: 10,
    gap: 8,
    marginTop: 10,
  },
  errorText: { fontSize: 12, color: "#E74C3C", flex: 1 },
  continueBtn: {
    backgroundColor: "#0D2A94",
    width: "100%",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    bottom: 40,
    elevation: 3,
  },
  continueText: { color: "white", fontWeight: "bold", fontSize: 16 },
});
