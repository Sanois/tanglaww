import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function AdminNotifications() {
    const router = useRouter();

    const NotificationItem = ({ title, description, time, date, type }: any) => {
        const getTitleColor = () => {
            if (type === 'assessment') return "#FFD75E";
            if (type === 'schedule') return "#FFD75E";
            return "#FFD75E"; 
        };

        return (
            <View style={styles.notificationCard}>
                <View style={styles.iconContainer}>
                    <Ionicons name="person-circle-outline" size={32} color="#555" />
                </View>
                <View style={styles.textContainer}>
                    <Text style={[styles.notiTitle, { color: getTitleColor() }]}>{title}</Text>
                    <Text style={styles.notiDescription}>{description}</Text>
                </View>
                <View style={styles.dateTimeContainer}>
                    <Text style={styles.notiDate}>{date}</Text>
                    <Text style={styles.notiTime}>{time}</Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.sectionHeader}>Today</Text>
                <NotificationItem 
                    title="New assessment given!" 
                    description="Lorem ipsum dolor sit amet" 
                    date="Oct. 23, 2026"
                    time="10:00AM"
                    type="assessment"
                />
                <NotificationItem 
                    title="New schedule posted!" 
                    description="Lorem ipsum dolor sit amet" 
                    date="Oct. 23, 2026"
                    time="10:00AM"
                    type="schedule"
                />
                <NotificationItem 
                    title="Assessment graded!" 
                    description="Lorem ipsum dolor sit amet" 
                    date="Oct. 23, 2026"
                    time="10:00AM"
                    type="assessment"
                />

                <Text style={[styles.sectionHeader, { marginTop: 25 }]}>Yesterday</Text>
                <NotificationItem 
                    title="Announcement!" 
                    description="Lorem ipsum dolor sit amet" 
                    date="Oct. 22, 2026"
                    time="10:00AM"
                />
                <NotificationItem 
                    title="Promotions!" 
                    description="Lorem ipsum dolor sit amet" 
                    date="Oct. 22, 2026"
                    time="10:00AM"
                />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "white" },
    header: { 
        backgroundColor: "#2F459B", 
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
    scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
    sectionHeader: { 
        fontSize: 22, 
        fontWeight: "bold", 
        color: "#2F459B", 
        marginBottom: 15 
    },
    notificationCard: { 
        flexDirection: "row", 
        alignItems: "center", 
        backgroundColor: "white", 
        padding: 12, 
        borderRadius: 10, 
        borderWidth: 1, 
        borderColor: "#2F459B", 
        marginBottom: 12 
    },
    iconContainer: { marginRight: 12 },
    textContainer: { flex: 1 },
    notiTitle: { fontSize: 15, fontWeight: "bold" },
    notiDescription: { fontSize: 13, color: "#777", marginTop: 2 },
    dateTimeContainer: { alignItems: "flex-end" },
    notiDate: { fontSize: 10, color: "#777" },
    notiTime: { fontSize: 10, color: "#777", fontWeight: "bold" },
});