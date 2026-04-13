import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function AdminTodo() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [datePicker, setDatePicker] = useState(false);
  const [timePicker, setTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a title.");
      return;
    }

    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in.");

      const { error } = await supabase.from("admin_todo").insert({
        admin_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
        dueDate: dueDate ? dueDate.toISOString() : null,
      });

      if (error) throw new Error(error.message);

      Alert.alert("Saved!", "Task added successfully.");
      router.back();
    } catch (err: any) {
      Alert.alert("Error", err.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const formattedDate = dueDate
    ? dueDate.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      })
    : "";

  const formattedTime = dueDate
    ? dueDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add new to do</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Title:</Text>
          <TextInput
            style={styles.input}
            placeholder="Title of item"
            placeholderTextColor="#BDC3C7"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Deadline:</Text>
          <TouchableOpacity
            style={styles.inputWithIcon}
            onPress={() => {
              console.log("DATE CLICKED");
              setDatePicker(true);
            }}
          >
            <Text
              style={{ flex: 1, color: formattedDate ? "#333" : "#BDC3C7" }}
            >
              {formattedDate || "MM / DD / YYYY"}
            </Text>
            <Ionicons name="calendar-outline" size={20} color="#FFB800" />
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Time:</Text>
          <TouchableOpacity
            style={styles.inputWithIcon}
            onPress={() => {
              console.log("TIME CLICKED");
              setTimePicker(true);
            }}
          >
            <Text
              style={{ flex: 1, color: formattedTime ? "#333" : "#BDC3C7" }}
            >
              {formattedTime || "HH : MM"}
            </Text>
            <Ionicons name="time-outline" size={20} color="#FFB800" />
          </TouchableOpacity>
        </View>

        {datePicker && (
          <DateTimePicker
            value={dueDate ?? new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, date) => {
              setDatePicker(false);
              if (date) {
                const updated = dueDate ? new Date(dueDate) : new Date();
                updated.setFullYear(
                  date.getFullYear(),
                  date.getMonth(),
                  date.getDate(),
                );
                setDueDate(updated);
              }
            }}
          />
        )}

        {timePicker && (
          <DateTimePicker
            value={dueDate ?? new Date()}
            mode="time"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, date) => {
              setTimePicker(false);
              if (date) {
                const updated = dueDate ? new Date(dueDate) : new Date();
                updated.setHours(date.getHours(), date.getMinutes());
                setDueDate(updated);
              }
            }}
          />
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Short details:</Text>
          <TextInput
            style={[styles.input, { height: 80, textAlignVertical: "top" }]}
            placeholder="Write a brief description of your event"
            placeholderTextColor="#BDC3C7"
            multiline
            value={description}
            onChangeText={setDescription}
          />
        </View>

        <TouchableOpacity
          style={[styles.saveButton, loading && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    backgroundColor: "#FFD75E",
  },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  form: { padding: 20 },
  inputGroup: { marginBottom: 20 },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#2F459B",
  },
  input: {
    borderWidth: 1,
    borderColor: "#EEE",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EEE",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: "#2F459B",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: { color: "white", fontWeight: "bold", fontSize: 16 },
});
