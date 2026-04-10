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

export default function AdminEditAbout() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'Tanglaw' | 'TARC'>('Tanglaw');
    
    const [tanglawContent, setTanglawContent] = useState(
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat"
    );
    
    const [tarcContent, setTarcContent] = useState(
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
    );

    const handleSave = () => {
        Alert.alert("Success", "About information has been updated.", [
            { text: "OK", onPress: () => router.back() }
        ]);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit About Content</Text>
                <TouchableOpacity onPress={handleSave}>
                    <Text style={styles.saveText}>Save</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.tabContainer}>
                <TouchableOpacity 
                    style={[styles.tab, activeTab === 'Tanglaw' && styles.activeTab]}
                    onPress={() => setActiveTab('Tanglaw')}
                >
                    <Text style={[styles.tabText, activeTab === 'Tanglaw' && styles.activeTabText]}>Tanglaw</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.tab, activeTab === 'TARC' && styles.activeTab]}
                    onPress={() => setActiveTab('TARC')}
                >
                    <Text style={[styles.tabText, activeTab === 'TARC' && styles.activeTabText]}>TARC</Text>
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"} 
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Description for {activeTab}</Text>
                        <TextInput
                            style={styles.textArea}
                            multiline
                            numberOfLines={10}
                            textAlignVertical="top"
                            value={activeTab === 'Tanglaw' ? tanglawContent : tarcContent}
                            onChangeText={activeTab === 'Tanglaw' ? setTanglawContent : setTarcContent}
                            placeholder="Enter description here..."
                        />
                    </View>

                    <View style={styles.infoBox}>
                        <Ionicons name="information-circle-outline" size={20} color="#2F459B" />
                        <Text style={styles.infoText}>
                            Changes made here will be reflected immediately in the student's "About" section.
                        </Text>
                    </View>
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
    headerTitle: { fontSize: 18, fontWeight: "bold", color: "black" },
    saveText: { fontSize: 16, fontWeight: "bold", color: "#2F459B" },
    tabContainer: {
        flexDirection: 'row',
        padding: 15,
        backgroundColor: '#F8F9FA'
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
    },
    activeTab: {
        backgroundColor: '#2F459B',
    },
    tabText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#666',
    },
    activeTabText: {
        color: 'white',
    },
    scrollContent: { padding: 20 },
    inputContainer: { marginBottom: 20 },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    textArea: {
        backgroundColor: '#F9F9F9',
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 12,
        padding: 15,
        fontSize: 15,
        color: '#333',
        minHeight: 200,
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#F0F4FF',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    infoText: {
        flex: 1,
        marginLeft: 10,
        fontSize: 12,
        color: '#2F459B',
        lineHeight: 18,
    },
});