import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../lib/supabase";

export default function NewPassScreen() {
  const router = useRouter();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const validate = (): string[] => {
    const rules = [
      {
        test: () => oldPassword.trim().length > 0,
        message: "Please enter your current password.",
      },
      {
        test: () => newPassword.length >= 8,
        message: "New password must be at least 8 characters.",
      },
      {
        test: () => /[0-9]/.test(newPassword),
        message: "New password must contain at least one number.",
      },
      {
        test: () => /[a-z]/.test(newPassword),
        message: "New password must contain at least one lowercase letter.",
      },
      {
        test: () => /[A-Z]/.test(newPassword),
        message: "New password must contain at least one uppercase letter.",
      },
      {
        test: () => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword),
        message: "New password must contain at least one special character.",
      },
      {
        test: () => newPassword !== oldPassword,
        message: "New password must be different from your current password.",
      },
      {
        test: () => newPassword === confirmPassword,
        message: "Passwords do not match.",
      },
    ];
    return rules.filter((r) => !r.test()).map((r) => r.message);
  };

  const handleChangePassword = async () => {
    const validationErrors = validate();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.email) throw new Error("No authenticated user found.");

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: oldPassword,
      });

      if (signInError) {
        setErrors(["Current password is incorrect."]);
        setLoading(false);
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw new Error(updateError.message);

      Alert.alert(
        "Password Changed",
        "Your password has been updated successfully.",
        [{ text: "OK", onPress: () => router.back() }],
      );
    } catch (err: any) {
      setErrors([err.message ?? "Something went wrong. Please try again."]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Change Password</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Current Password:*</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Current Password"
              placeholderTextColor="#A9A9A9"
              secureTextEntry={!showOld}
              value={oldPassword}
              onChangeText={(t) => {
                setOldPassword(t);
                setErrors([]);
              }}
            />
            <TouchableOpacity onPress={() => setShowOld(!showOld)}>
              <Feather
                name={showOld ? "eye" : "eye-off"}
                size={20}
                color="#7F8C8D"
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>New Password:*</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="New Password"
              placeholderTextColor="#A9A9A9"
              secureTextEntry={!showNew}
              value={newPassword}
              onChangeText={(t) => {
                setNewPassword(t);
                setErrors([]);
              }}
            />
            <TouchableOpacity onPress={() => setShowNew(!showNew)}>
              <Feather
                name={showNew ? "eye" : "eye-off"}
                size={20}
                color="#7F8C8D"
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Confirm New Password:*</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Confirm New Password"
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
          <Text style={styles.rulesTitle}>Password requirements:</Text>
          {[
            "At least 8 characters",
            "One uppercase letter (A-Z)",
            "One lowercase letter (a-z)",
            "One number (0-9)",
            "One special character (!@#$...)",
          ].map((rule) => (
            <View key={rule} style={styles.ruleRow}>
              <Ionicons name="ellipse" size={6} color="#0D2A94" />
              <Text style={styles.ruleText}>{rule}</Text>
            </View>
          ))}
        </View>

        {errors.length > 0 && (
          <View style={styles.errorBanner}>
            <Ionicons
              name="alert-circle"
              size={18}
              color="#c0392b"
              style={{ marginTop: 2 }}
            />
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
          style={[styles.doneButton, loading && { opacity: 0.7 }]}
          onPress={handleChangePassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.doneButtonText}>Update Password</Text>
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
  content: { padding: 25 },
  inputContainer: { marginBottom: 16 },
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
    padding: 14,
    marginBottom: 16,
    gap: 6,
  },
  rulesTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0D2A94",
    marginBottom: 6,
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
    marginBottom: 16,
  },
  errorText: { color: "#c0392b", fontSize: 13, lineHeight: 20 },
  doneButton: {
    backgroundColor: "#0D2A94",
    height: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  doneButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
});
