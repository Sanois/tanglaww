import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, FlatList, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAdmin } from "../context/AdminContext";

export default function AdminRegistry() {
    const router = useRouter();
    const { students, loading } = useAdmin();
    const [search, setSearch] = useState("");

    const filteredStudents = students.filter(s => 
        s.name.toLowerCase().includes(search.toLowerCase()) || 
        s.code.toLowerCase().includes(search.toLowerCase())
    );

    const renderItem = ({ item }: any) => (
        <View style={styles.studentCard}>
            <View style={styles.avatar}><Ionicons name="person" size={20} color="#666" /></View>
            <View style={{ flex: 1, marginLeft: 15 }}>
                <Text style={styles.sName}>{item.name}</Text>
                <Text style={styles.sSub}>{item.major} • {item.email}</Text>
                <Text style={styles.sCode}>Code: {item.code}</Text>
            </View>
            <TouchableOpacity><Ionicons name="ellipsis-vertical" size={20} color="#CCC" /></TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color="black" /></TouchableOpacity>
                <Text style={styles.title}>Student Registry</Text>
            </View>
            <View style={styles.searchBox}>
                <Ionicons name="search" size={20} color="#999" />
                <TextInput 
                    placeholder="Search by name or enrollment code..." 
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
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ padding: 20 }}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "white" },
    header: { backgroundColor: "#FFD75E", flexDirection: "row", padding: 20, alignItems: "center" },
    title: { fontSize: 18, fontWeight: "bold", marginLeft: 20 },
    searchBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#F0F0F0", margin: 20, padding: 10, borderRadius: 10 },
    input: { marginLeft: 10, flex: 1 },
    studentCard: { flexDirection: "row", alignItems: "center", padding: 15, borderBottomWidth: 1, borderBottomColor: "#EEE" },
    avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#F0F0F0", alignItems: "center", justifyContent: "center" },
    sName: { fontWeight: "bold", color: "#2F459B" },
    sSub: { fontSize: 12, color: "#666" },
    sCode: { fontSize: 11, color: "#999", marginTop: 2 },
});