import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function AdminNotification() {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");

    const handlePublish = () => {
        if (!title || !message) {
            Alert.alert("Error", "Please fill in both the title and the message.");
            return;
        }

        // Logic to send notification to students would go here
        Alert.alert("Success", "Notification sent to all students!", [
            { text: "OK", onPress: () => router.back() }
        ]);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Create Notification</Text>
                <View style={{ width: 40 }} /> 
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.content}>
                    <View style={styles.infoSection}>
                        <Ionicons name="megaphone" size={40} color="#FFD75E" />
                        <Text style={styles.infoTitle}>Broadcast Message</Text>
                        <Text style={styles.infoSubtitle}>
                            The information you post here will be visible to all students on their dashboards.
                        </Text>
                    </View>

                    <View style={styles.form}>
                        <Text style={styles.label}>Notification Title</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., Enrollment Update"
                            value={title}
                            onChangeText={setTitle}
                        />

                        <Text style={styles.label}>Message Body</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Type your announcement here..."
                            value={message}
                            onChangeText={setMessage}
                            multiline
                            numberOfLines={6}
                            textAlignVertical="top"
                        />
                    </View>

                    <TouchableOpacity style={styles.publishBtn} onPress={handlePublish}>
                        <Text style={styles.publishText}>Publish Announcement</Text>
                        <Ionicons name="send" size={18} color="white" style={{ marginLeft: 10 }} />
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "white" },
    header: {
        backgroundColor: "#FFD75E",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 15,
        justifyContent: "space-between",
    },
    backBtn: { width: 40, height: 40, justifyContent: 'center' },
    headerTitle: { fontSize: 18, fontWeight: "bold", color: "black" },
    content: { padding: 25 },
    infoSection: { 
        alignItems: 'center', 
        marginBottom: 30, 
        backgroundColor: '#F8F9FA', 
        padding: 20, 
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#EEE'
    },
    infoTitle: { fontSize: 20, fontWeight: 'bold', color: '#2F459B', marginTop: 10 },
    infoSubtitle: { fontSize: 13, color: '#666', textAlign: 'center', marginTop: 5, lineHeight: 18 },
    form: { marginBottom: 30 },
    label: { fontSize: 14, fontWeight: 'bold', color: '#2F459B', marginBottom: 8 },
    input: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#DCDFE3',
        borderRadius: 10,
        padding: 15,
        fontSize: 16,
        marginBottom: 20,
        color: '#333'
    },
    textArea: {
        height: 150,
        paddingTop: 15,
    },
    publishBtn: {
        backgroundColor: '#2F459B',
        padding: 18,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4
    },
    publishText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});