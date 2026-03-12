import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
    Dimensions,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

const { width } = Dimensions.get('window');

export default function HandoutDetail() {
    const router = useRouter();
    const { courseTitle = "LET On Boarding (Concept-Driven)" } = useLocalSearchParams();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Handouts</Text>
            </View>

            <View style={styles.content}>
                <Text style={styles.mainTitle}>{courseTitle}</Text>
                <Text style={styles.subTitle}>Handouts</Text>

                <View style={styles.documentCard}>
                    <MaterialCommunityIcons name="book-open-variant" size={60} color="#BDC3C7" />
                </View>

                <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.actionButton}>
                        <Ionicons name="eye-outline" size={20} color="#2F459B" />
                        <Text style={styles.buttonText}>View</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton}>
                        <Ionicons name="download-outline" size={20} color="#2F459B" />
                        <Text style={styles.buttonText}>Download</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navArrow} disabled>
                    <Ionicons name="chevron-back" size={24} color="#DCDFE3" />
                </TouchableOpacity>
                
                <Text style={styles.navLabel}>Handouts</Text>

                <TouchableOpacity style={styles.navArrow} disabled>
                    <Ionicons name="chevron-forward" size={24} color="#DCDFE3" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "white" },
    header: { 
        backgroundColor: "#0D2A94", 
        flexDirection: "row", 
        alignItems: "center", 
        paddingHorizontal: 20, 
        paddingVertical: 18 
    },
    headerTitle: { 
        fontSize: 20, 
        fontWeight: "bold", 
        color: "white", 
        marginLeft: 15 
    },
    content: { 
        flex: 1, 
        alignItems: "center", 
        paddingHorizontal: 25, 
        paddingTop: 30 
    },
    mainTitle: { 
        fontSize: 18, 
        fontWeight: "bold", 
        textAlign: "center", 
        color: "black" 
    },
    subTitle: { 
        fontSize: 18, 
        fontWeight: "bold", 
        textAlign: "center", 
        color: "black",
        marginBottom: 20 
    },
    documentCard: {
        width: '100%',
        height: width * 0.9,
        backgroundColor: '#F2F4F7',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#DCDFE3',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%'
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '48%',
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#2F459B',
        backgroundColor: 'white'
    },
    buttonText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#2F459B',
        marginLeft: 8
    },
    bottomNav: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderTopWidth: 1,
        borderTopColor: '#EEE',
    },
    navArrow: { padding: 5 },
    navLabel: { fontSize: 16, color: 'black', fontWeight: '500' }
});