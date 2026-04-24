import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAdmin } from "../../context/AdminContext";

export default function AdminRegistry() {
  const router = useRouter();
  const { students, loading } = useAdmin();
  const [search, setSearch] = useState("");

  const filteredStudents = students.filter((s) => {
    const fullName =
      `${s.student?.firstName ?? ""} ${s.student?.lastName ?? ""}`.toLowerCase();
    const email = s.student?.email?.toLowerCase() ?? "";
    const id = s.student?.id?.toString() ?? "";
    return (
      fullName.includes(search.toLowerCase()) ||
      email.includes(search.toLowerCase()) ||
      id.includes(search.toLowerCase())
    );
  });

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.studentCard}
      onPress={() =>
        router.push({
          pathname: "/admin/registry/[id]",
          params: { id: item.id },
        } as any)
      }
    >
      <View style={styles.studentCard}>
        <Ionicons name="person" size={20} color="#666" />
      </View>
      <View style={{ flex: 1, marginLeft: 15 }}>
        <Text style={styles.sName}>
          {item.student?.firstName} {item.student?.lastName}
        </Text>
        <Text style={styles.sSub}>
          {item.curriculum?.curriculumName} • {item.student?.email}
        </Text>
        <Text style={styles.sID}>ID: {item.student.id}</Text>
      </View>
      <TouchableOpacity>
        <Ionicons name="ellipsis-vertical" size={20} color="#CCC" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Student Registry</Text>
      </View>
      <View style={styles.searchBox}>
        <Ionicons name="search" size={20} color="#999" />
        <TextInput
          placeholder="Search by name or email address"
          style={styles.input}
          value={search}
          onChangeText={setSearch}
        />
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#2F459B" />
      ) : (
        <FlatList
          data={filteredStudents}
          renderItem={renderItem}
          keyExtractor={(item, index) =>
            item.id?.toString() ?? index.toString()
          }
          contentContainerStyle={{ padding: 20 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  header: {
    backgroundColor: "#FFD75E",
    flexDirection: "row",
    padding: 20,
    alignItems: "center",
  },
  title: { fontSize: 18, fontWeight: "bold", marginLeft: 20 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    margin: 20,
    padding: 10,
    borderRadius: 10,
  },
  input: { marginLeft: 10, flex: 1 },
  studentCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    alignItems: "center",
    justifyContent: "center",
  },
  sName: { fontWeight: "bold", color: "#2F459B" },
  sSub: { fontSize: 12, color: "#666" },
  sID: { fontSize: 11, color: "#999", marginTop: 2 },
});
