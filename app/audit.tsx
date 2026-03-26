import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, Alert, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAdmin } from "../context/AdminContext";
import { adminService } from "../services/adminService";

export default function AdminAudit() {
    const router = useRouter();
    const { auditRequests, refreshData, loading } = useAdmin();

    const handleAction = async (id: string, action: 'approved' | 'rejected') => {
        await adminService.processAudit(id, action);
        await refreshData();
        Alert.alert("Success", `Request ${action}`);
    };

    const renderItem = ({ item }: any) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View>
                    <Text style={styles.userName}>{item.user}</Text>
                    <Text style={styles.userEmail}>{item.email}</Text>
                </View>
                <Text style={styles.dateText}>{item.date}</Text>
            </View>
            <View style={styles.auditBody}>
                <Text style={styles.label}>Changing {item.field}:</Text>
                <View style={styles.compareRow}>
                    <Text style={styles.oldVal}>{item.oldValue}</Text>
                    <Ionicons name="arrow-forward" size={16} color="#CCC" />
                    <Text style={styles.newVal}>{item.newValue}</Text>
                </View>
            </View>
            <View style={styles.btnRow}>
                <TouchableOpacity style={styles.rejBtn} onPress={() => handleAction(item.id, 'rejected')}>
                    <Text style={styles.rejText}>Reject</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.appBtn} onPress={() => handleAction(item.id, 'approved')}>
                    <Text style={styles.appText}>Approve</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color="black" /></TouchableOpacity>
                <Text style={styles.title}>Audit Queue ({auditRequests.length})</Text>
            </View>
            {loading ? (
                <ActivityIndicator size="large" color="#2F459B" style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={auditRequests}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ padding: 20 }}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F9FBFF" },
    header: { backgroundColor: "#FFD75E", flexDirection: "row", padding: 20, alignItems: "center" },
    title: { fontSize: 18, fontWeight: "bold", marginLeft: 20 },
    card: { backgroundColor: "white", borderRadius: 12, padding: 15, marginBottom: 15, elevation: 2 },
    cardHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
    userName: { fontWeight: "bold", color: "#2F459B" },
    userEmail: { fontSize: 12, color: "#777" },
    dateText: { fontSize: 10, color: "#AAA" },
    auditBody: { marginVertical: 10 },
    label: { fontSize: 12, color: "#555" },
    compareRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 5 },
    oldVal: { color: "#777", textDecorationLine: "line-through" },
    newVal: { fontWeight: "bold", color: "#2F459B" },
    btnRow: { flexDirection: "row", gap: 10, marginTop: 10 },
    appBtn: { flex: 1, backgroundColor: "#2F459B", padding: 10, borderRadius: 8, alignItems: "center" },
    rejBtn: { flex: 1, borderWidth: 1, borderColor: "#E74C3C", padding: 10, borderRadius: 8, alignItems: "center" },
    appText: { color: "white", fontWeight: "bold" },
    rejText: { color: "#E74C3C", fontWeight: "bold" },
});