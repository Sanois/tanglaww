import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { supabase } from "../lib/supabase";

type Step = "email" | "sent";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<Step>("email");

  const handleSendReset = async () => {
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const { data: student } = await supabase
        .from("student")
        .select("id, isAccountSetup")
        .eq("email", email.trim().toLowerCase())
        .maybeSingle();

      if (!student) {
        setError("No account found with that email address.");
        setLoading(false);
        return;
      }

      if (!student.isAccountSetup) {
        setError(
          "This account has not been activated yet. Please use your activation code first.",
        );
        setLoading(false);
        return;
      }

      const redirectTo = Linking.createURL("resetpass");

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        { redirectTo },
      );

      console.log("Reset email error:", resetError);
      console.log("Reset email error message:", resetError?.message);
      console.log("Reset email error status:", resetError?.status);

      if (resetError) throw new Error(resetError.message);

      setStep("sent");
    } catch (err: any) {
      setError(err.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (step === "email") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Forgot Password</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.content}>
          <View style={styles.iconWrap}>
            <Ionicons name="lock-open-outline" size={60} color="#0D2A94" />
          </View>

          <Text style={styles.title}>Reset your password</Text>
          <Text style={styles.subtitle}>
            Enter the email address linked to your account and we'll send you a
            password reset link.
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email Address:</Text>
            <View
              style={[styles.inputWrapper, error ? styles.inputError : null]}
            >
              <Ionicons name="mail-outline" size={20} color="#7F8C8D" />
              <TextInput
                style={styles.input}
                placeholder="youremail@example.com"
                placeholderTextColor="#A9A9A9"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  setError("");
                }}
              />
            </View>
            {error ? (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={16} color="#c0392b" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}
          </View>

          <TouchableOpacity
            style={[styles.btn, loading && { opacity: 0.7 }]}
            onPress={handleSendReset}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.btnText}>Send Reset Link</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backToLogin}
            onPress={() => router.back()}
          >
            <Text style={styles.backToLoginText}>Back to Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Forgot Password</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <Ionicons name="mail" size={60} color="#27ae60" />
        </View>

        <Text style={styles.title}>Check your email</Text>
        <Text style={styles.subtitle}>We sent a password reset link to:</Text>
        <Text style={styles.emailHighlight}>{email}</Text>
        <Text style={[styles.subtitle, { marginTop: 10 }]}>
          Tap the link in the email to reset your password. The link expires in
          1 hour.
        </Text>

        <View style={styles.tipsCard}>
          <View style={styles.tipRow}>
            <Ionicons name="checkmark-circle" size={16} color="#27ae60" />
            <Text style={styles.tipText}>Check your spam or junk folder</Text>
          </View>
          <View style={styles.tipRow}>
            <Ionicons name="checkmark-circle" size={16} color="#27ae60" />
            <Text style={styles.tipText}>
              Make sure you open the link on this device
            </Text>
          </View>
          <View style={styles.tipRow}>
            <Ionicons name="checkmark-circle" size={16} color="#27ae60" />
            <Text style={styles.tipText}>The link expires in 1 hour</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.btn, { marginTop: 10 }]}
          onPress={() => {
            setStep("email");
            setEmail("");
          }}
        >
          <Text style={styles.btnText}>Resend Email</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backToLogin}
          onPress={() => router.back()}
        >
          <Text style={styles.backToLoginText}>Back to Sign In</Text>
        </TouchableOpacity>
      </View>
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
  headerTitle: { color: "white", fontSize: 20, fontWeight: "bold" },
  content: { flex: 1, padding: 25, alignItems: "center" },
  iconWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#F0F4FF",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0D2A94",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  emailHighlight: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#0D2A94",
    marginTop: 5,
  },
  inputContainer: { width: "100%", marginTop: 25 },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DCDFE3",
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 50,
    backgroundColor: "#F9FAFB",
    gap: 10,
  },
  inputError: { borderColor: "#e74c3c" },
  input: { flex: 1, fontSize: 15, color: "#333" },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff5f5",
    borderWidth: 1,
    borderColor: "#e74c3c",
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
    gap: 6,
  },
  errorText: { fontSize: 12, color: "#c0392b", flex: 1 },
  btn: {
    backgroundColor: "#0D2A94",
    width: "100%",
    height: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 25,
  },
  btnText: { color: "white", fontSize: 16, fontWeight: "bold" },
  backToLogin: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    gap: 6,
  },
  backToLoginText: {
    color: "#0D2A94",
    fontSize: 14,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  tipsCard: {
    backgroundColor: "#F0F4FF",
    borderRadius: 12,
    padding: 16,
    width: "100%",
    marginTop: 20,
    gap: 10,
  },
  tipRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  tipText: { fontSize: 13, color: "#555", flex: 1 },
});
