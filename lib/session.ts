import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import { supabase } from "./supabase";

const TOKEN_KEY = "tarc_session_token";
const STUDENT_ID_KEY = "tarc_student_id";

export const generateSessionToken = async (): Promise<string> => {
  const random = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    Math.random().toString() + Date.now().toString(),
  );
  return random;
};

export const registerSession = async (
  studentId: number,
  token: string,
): Promise<void> => {
  const { error } = await supabase
    .from("student")
    .update({
      session_token: token,
      session_created_at: new Date().toISOString(),
    })
    .eq("id", studentId);

  if (error) {
    console.error("Session register error:", error.message);
    return;
  }

  await AsyncStorage.setItem(TOKEN_KEY, token);
  await AsyncStorage.setItem(STUDENT_ID_KEY, studentId.toString());
};

export const validateSession = async (): Promise<{
  valid: boolean;
  studentId: number | null;
}> => {
  try {
    const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
    const storedId = await AsyncStorage.getItem(STUDENT_ID_KEY);

    if (!storedToken || !storedId) return { valid: true, studentId: null };

    const studentId = parseInt(storedId);

    const { data, error } = await supabase
      .from("student")
      .select("session_token")
      .eq("id", studentId)
      .single();

    if (error || !data) return { valid: false, studentId };

    const isValid = data.session_token === storedToken;
    return { valid: isValid, studentId };
  } catch (err) {
    console.error("Session validation error:", err);
    return { valid: false, studentId: null };
  }
};

export const clearSession = async (studentId?: number): Promise<void> => {
  await AsyncStorage.removeItem(TOKEN_KEY);
  await AsyncStorage.removeItem(STUDENT_ID_KEY);

  if (studentId) {
    await supabase
      .from("student")
      .update({
        session_token: null,
        session_created_at: null,
      })
      .eq("id", studentId);
  }
};

export const getStoredStudentId = async (): Promise<number | null> => {
  const id = await AsyncStorage.getItem(STUDENT_ID_KEY);
  return id ? parseInt(id) : null;
};
