import { Feather, Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
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

type Step = "form" | "success";
type SessionState = "loading" | "ready" | "error";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [step, setStep] = useState<Step>("form");
  const [sessionState, setSessionState] = useState<SessionState>("loading");
  const [sessionError, setSessionError] = useState("");

  // Guard so multiple sources don't race to set the session
  const sessionSetRef = useRef(false);

  const markReady = () => {
    if (sessionSetRef.current) return;
    sessionSetRef.current = true;
    setSessionState("ready");
  };

  const markError = (msg: string) => {
    if (sessionSetRef.current) return;
    sessionSetRef.current = true;
    setSessionError(msg);
    setSessionState("error");
  };

  const handleResetUrl = async (url: string) => {
    if (sessionSetRef.current) return;
    console.log("handleResetUrl:", url);

    try {
      const fragment = url.includes("#")
        ? url.split("#")[1]
        : url.split("?")[1];

      if (!fragment) {
        markError("Invalid reset link. Please request a new one.");
        return;
      }

      const params = new URLSearchParams(fragment);
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");
      const type = params.get("type");

      if (type !== "recovery") {
        markError("Invalid reset link type. Please request a new one.");
        return;
      }

      if (!accessToken || !refreshToken) {
        markError("Incomplete reset link. Please request a new one.");
        return;
      }

      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (error) {
        console.error("setSession error:", error.message);
        markError("Reset link has expired. Please request a new one.");
        return;
      }

      markReady();
    } catch (err: any) {
      console.error("handleResetUrl error:", err.message);
      markError("Failed to verify reset link. Please request a new one.");
    }
  };

  useEffect(() => {
    let urlSub: ReturnType<typeof Linking.addEventListener> | null = null;
    let authListener: any = null;
    // Timeout so we never show an infinite spinner — after 8s, show an error
    const timeoutId = setTimeout(() => {
      markError(
        "Reset link verification timed out. Please tap the link in your email again, or request a new one.",
      );
    }, 8000);

    const init = async () => {
      // ── Source 1: Supabase already has a recovery session (fastest path) ──
      // This fires when the user was already logged in or the OS restored session
      const { data: listener } = supabase.auth.onAuthStateChange(
        (event, session) => {
          if (event === "PASSWORD_RECOVERY" && session) {
            console.log("PASSWORD_RECOVERY fired");
            clearTimeout(timeoutId);
            markReady();
          }
        },
      );
      authListener = listener;

      // ── Source 2: App opened cold from the deep link ──
      const initialUrl = await Linking.getInitialURL();
      console.log("Initial URL:", initialUrl);
      if (initialUrl?.includes("resetpass")) {
        clearTimeout(timeoutId);
        await handleResetUrl(initialUrl);
        return;
      }

      // ── Source 3: App was backgrounded and URL arrives as an event ──
      urlSub = Linking.addEventListener("url", async ({ url }) => {
        console.log("URL event:", url);
        if (url.includes("resetpass")) {
          clearTimeout(timeoutId);
          await handleResetUrl(url);
        }
      });

      // ── Source 4: Check if there's already an active session with recovery ──
      // Covers the rare case where setSession was called before this screen mounted
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session) {
        console.log("Existing session found");
        clearTimeout(timeoutId);
        markReady();
      }
    };

    init();

    return () => {
      clearTimeout(timeoutId);
      urlSub?.remove();
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const validate = (): string[] => {
    const rules = [
      {
        test: () => password.length >= 8,
        message: "Password must be at least 8 characters.",
      },
      {
        test: () => /[0-9]/.test(password),
        message: "Password must contain at least one number.",
      },
      {
        test: () => /[a-z]/.test(password),
        message: "Password must contain at least one lowercase letter.",
      },
      {
        test: () => /[A-Z]/.test(password),
        message: "Password must contain at least one uppercase letter.",
      },
      {
        test: () => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
        message: "Password must contain at least one special character.",
      },
      {
        test: () => password === confirmPassword,
        message: "Passwords do not match.",
      },
    ];
    return rules.filter((r) => !r.test()).map((r) => r.message);
  };

  const handleReset = async () => {
    const validationErrors = validate();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);
    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw new Error(error.message);
      setStep("success");
    } catch (err: any) {
      setErrors([err.message ?? "Something went wrong. Please try again."]);
    } finally {
      setLoading(false);
    }
  };

  // ── Loading / Error screen ──────────────────────────────────────────────────
  if (sessionState !== "ready") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={{ width: 24 }} />
          <Text style={styles.headerTitle}>Reset Password</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.centered}>
          {sessionState === "error" ? (
            <>
              <Ionicons name="alert-circle" size={60} color="#E74C3C" />
              <Text style={styles.errorTitle}>Link Invalid</Text>
              <Text style={styles.errorSubtitle}>{sessionError}</Text>
              <TouchableOpacity
                style={styles.btn}
                onPress={() => router.replace("/forgotpassword" as any)}
              >
                <Text style={styles.btnText}>Request New Link</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.backToLogin}
                onPress={() => router.replace("/login")}
              >
                <Text style={styles.backToLoginText}>Back to Sign In</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <ActivityIndicator size="large" color="#0D2A94" />
              <Text style={styles.waitingText}>Verifying reset link...</Text>
              <Text style={styles.waitingSubText}>
                If this takes too long, tap the link in your email again.
              </Text>
            </>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // ── Success screen ──────────────────────────────────────────────────────────
  if (step === "success") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={{ width: 24 }} />
          <Text style={styles.headerTitle}>Reset Password</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.content}>
          <View style={styles.iconWrap}>
            <Ionicons name="checkmark-circle" size={60} color="#27ae60" />
          </View>
          <Text style={styles.title}>Password Updated!</Text>
          <Text style={styles.subtitle}>
            Your password has been successfully reset. You can now sign in with
            your new password.
          </Text>
          <TouchableOpacity
            style={styles.btn}
            onPress={async () => {
              await supabase.auth.signOut();
              router.replace("/login");
            }}
          >
            <Text style={styles.btnText}>Go to Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Form screen ─────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={{ width: 24 }} />
        <Text style={styles.headerTitle}>Reset Password</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <Ionicons name="lock-closed-outline" size={60} color="#0D2A94" />
        </View>

        <Text style={styles.title}>Create New Password</Text>
        <Text style={styles.subtitle}>
          Your new password must be different from your previous password.
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>New Password:*</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="New Password"
              placeholderTextColor="#A9A9A9"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                setErrors([]);
              }}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Feather
                name={showPassword ? "eye" : "eye-off"}
                size={20}
                color="#7F8C8D"
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Confirm Password:*</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor="#A9A9A9"
              secureTextEntry={!showConfirm}
              value={confirmPassword}
              onChangeText={(t) => {
                setConfirmPassword(t);
                setErrors([]);
              }}
            />
            <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
              <Feather
                name={showConfirm ? "eye" : "eye-off"}
                size={20}
                color="#7F8C8D"
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.rulesCard}>
          {[
            "At least 8 characters",
            "One uppercase letter",
            "One lowercase letter",
            "One number",
            "One special character",
          ].map((rule) => (
            <View key={rule} style={styles.ruleRow}>
              <Ionicons name="ellipse" size={6} color="#0D2A94" />
              <Text style={styles.ruleText}>{rule}</Text>
            </View>
          ))}
        </View>

        {errors.length > 0 && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={16} color="#c0392b" />
            <View style={{ flex: 1, marginLeft: 8 }}>
              {errors.map((e, i) => (
                <Text key={i} style={styles.errorText}>
                  • {e}
                </Text>
              ))}
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[styles.btn, loading && { opacity: 0.7 }]}
          onPress={handleReset}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.btnText}>Reset Password</Text>
          )}
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
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  waitingText: { marginTop: 15, color: "#666", fontSize: 14 },
  waitingSubText: {
    marginTop: 8,
    color: "#aaa",
    fontSize: 12,
    textAlign: "center",
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#E74C3C",
    marginTop: 15,
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 25,
  },
  content: { flex: 1, padding: 25, alignItems: "center" },
  iconWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#F0F4FF",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
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
    marginBottom: 10,
  },
  inputContainer: { width: "100%", marginBottom: 16 },
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
  },
  input: { flex: 1, fontSize: 15, color: "#333" },
  rulesCard: {
    backgroundColor: "#F0F4FF",
    borderRadius: 10,
    padding: 12,
    width: "100%",
    marginBottom: 16,
    gap: 6,
  },
  ruleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  ruleText: { fontSize: 12, color: "#555" },
  errorBanner: {
    flexDirection: "row",
    backgroundColor: "#fff5f5",
    borderWidth: 1,
    borderColor: "#e74c3c",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    width: "100%",
  },
  errorText: { color: "#c0392b", fontSize: 13, lineHeight: 20 },
  btn: {
    backgroundColor: "#0D2A94",
    width: "100%",
    height: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  btnText: { color: "white", fontSize: 16, fontWeight: "bold" },
  backToLogin: { marginTop: 16 },
  backToLoginText: {
    color: "#0D2A94",
    fontSize: 14,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
