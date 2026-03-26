import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import AdminHamburger from "./admin-hamburger";

const { width } = Dimensions.get('window');

export default function AdminCalendar() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("Upcoming");
    const [menuVisible, setMenuVisible] = useState(false);
    const tabSlideAnim = useRef(new Animated.Value(0)).current;

    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dates = Array.from({ length: 31 }, (_, i) => i + 1);

    const handleTabChange = (tabName: string, index: number) => {
        setActiveTab(tabName);
        Animated.spring(tabSlideAnim, {
            toValue: index * ((width - 40) / 2), 
            useNativeDriver: false,
            friction: 10,
            tension: 50
        }).start();
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => setMenuVisible(true)}>
                    <Ionicons name="menu" size={28} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Calendar</Text>
                <View style={{ width: 28 }} /> 
            </View>

            <AdminHamburger 
                visible={menuVisible} 
                onClose={() => setMenuVisible(false)} 
            />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.monthHeader}>
                    <TouchableOpacity><Ionicons name="chevron-back" size={24} color="#2F459B" /></TouchableOpacity>
                    <Text style={styles.monthText}>May 2026</Text>
                    <TouchableOpacity><Ionicons name="chevron-forward" size={24} color="#2F459B" /></TouchableOpacity>
                </View>

                <View style={styles.calendarGrid}>
                    {daysOfWeek.map(day => (
                        <Text key={day} style={styles.dayLabel}>{day}</Text>
                    ))}
                    {dates.map((date) => (
                        <TouchableOpacity 
                            key={date} 
                            style={[styles.dateBox, date === 9 && styles.selectedDate]}
                        >
                            <Text style={[styles.dateText, date === 9 && styles.selectedDateText]}>{date}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.tabWrapper}>
                    <View style={styles.tabContainer}>
                        <TouchableOpacity style={styles.tab} onPress={() => handleTabChange("Upcoming", 0)}>
                            <Text style={[styles.tabText, activeTab === "Upcoming" && styles.activeTabText]}>Upcoming Events</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.tab} onPress={() => handleTabChange("ToDo", 1)}>
                            <Text style={[styles.tabText, activeTab === "ToDo" && styles.activeTabText]}>To Do List</Text>
                        </TouchableOpacity>
                    </View>
                    <Animated.View style={[styles.underline, { left: tabSlideAnim }]} />
                </View>

                <View style={styles.listContainer}>
                    <Text style={styles.listHeader}>{activeTab === "Upcoming" ? "Upcoming Events" : "To Do List"}</Text>
                    
                    {activeTab === "Upcoming" ? (
                        <View style={styles.eventCard}>
                            <View style={styles.eventInfo}>
                                <Text style={styles.eventTitle}>LET Express - Online Session</Text>
                                <Text style={styles.eventLink} numberOfLines={1}>zoommtg://zoom.us/join?confno=...</Text>
                            </View>
                            <View style={styles.eventDateTime}>
                                <Text style={styles.eventDate}>Oct. 23, 2026</Text>
                                <Text style={styles.eventTime}>10:00AM</Text>
                            </View>
                        </View>
                    ) : (
                        <View>
                            {[1, 2, 3].map((item) => (
                                <View key={item} style={styles.todoCard}>
                                    <View style={styles.todoTextContainer}>
                                        <Text style={styles.todoTitle}>To review LET on Boarding</Text>
                                        <Text style={styles.todoDate}>Oct. 23, 2026 10:00AM</Text>
                                    </View>
                                    <Ionicons 
                                        name={item === 1 ? "checkbox" : "square-outline"} 
                                        size={24} 
                                        color="#2F459B" 
                                    />
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>

            <TouchableOpacity 
                style={styles.fab} 
                onPress={() => router.push("/admin-todo")}
            >
                <Ionicons name="add" size={32} color="white" />
            </TouchableOpacity>

            <View style={styles.tabBar}>
                <TouchableOpacity style={styles.tabItem} onPress={() => router.push("/admin-dashboard")}>
                    <Ionicons name="home-outline" size={24} color="#2F459B" />
                    <Text style={styles.tabLabel}>Home</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabItem} onPress={() => router.push("/admin-approval")}>
                    <Ionicons name="person-outline" size={24} color="#2F459B" />
                    <Text style={styles.tabLabel}>Approvals</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabItem}>
                    <Ionicons name="calendar" size={24} color="#FFD75E" />
                    <Text style={[styles.tabLabel, { color: "#FFD75E" }]}>Calendar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabItem} onPress={() => router.push("/admin-courses")}>
                    <Ionicons name="school-outline" size={24} color="#2F459B" />
                    <Text style={styles.tabLabel}>Courses</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "white" },
    header: { backgroundColor: "#FFD75E", flexDirection: "row", alignItems: "center", justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15 },
    headerTitle: { fontSize: 20, fontWeight: "bold", color: "black" },
    scrollContent: { paddingBottom: 120 },
    monthHeader: { flexDirection: "row", justifyContent: "center", alignItems: "center", paddingVertical: 25 },
    monthText: { fontSize: 18, fontWeight: "bold", color: "#2F459B", marginHorizontal: 40 },
    calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 15, marginBottom: 20 },
    dayLabel: { width: (width - 30) / 7, textAlign: 'center', color: '#BDC3C7', fontSize: 13, marginBottom: 15, fontWeight: '500' },
    dateBox: { width: (width - 30) / 7, height: 45, justifyContent: 'center', alignItems: 'center', marginBottom: 5 },
    dateText: { color: '#2F459B', fontSize: 15 },
    selectedDate: { backgroundColor: '#FFD75E', borderRadius: 25 },
    selectedDateText: { fontWeight: 'bold', color: '#2F459B' },
    tabWrapper: { 
        marginHorizontal: 20, 
        marginTop: 10, 
        backgroundColor: '#FFD75E', 
        borderRadius: 12, 
        height: 50,
        position: 'relative',
    },
    tabContainer: { flexDirection: "row", width: '100%', height: '100%' },
    tab: { flex: 1, justifyContent: "center", alignItems: "center" },
    underline: {
        position: 'absolute',
        bottom: 0,
        height: 4,
        width: (width - 40) / 2,
        backgroundColor: 'white',
        borderRadius: 2,
    },
    tabText: { fontWeight: "bold", color: "rgba(47, 69, 155, 0.6)" },
    activeTabText: { color: "#2F459B" },
    listContainer: { padding: 20 },
    listHeader: { fontSize: 22, fontWeight: "bold", color: "#2F459B", marginBottom: 15 },
    eventCard: { flexDirection: "row", backgroundColor: "white", padding: 15, borderRadius: 12, borderWidth: 1, borderColor: "#EEE", marginBottom: 12 },
    eventInfo: { flex: 1 },
    eventTitle: { fontSize: 16, fontWeight: "bold", color: "#444" },
    eventLink: { fontSize: 11, color: "#2F459B", textDecorationLine: "underline", marginTop: 4 },
    eventDateTime: { alignItems: "flex-end", justifyContent: 'center' },
    eventDate: { fontSize: 12, fontWeight: "bold", color: "#7F8C8D" },
    eventTime: { fontSize: 12, color: "#95A5A6" },
    todoCard: { flexDirection: "row", alignItems: "center", backgroundColor: "white", padding: 15, borderRadius: 12, borderWidth: 1, borderColor: "#EEE", marginBottom: 12 },
    todoTextContainer: { flex: 1 },
    todoTitle: { fontSize: 16, fontWeight: "bold", color: "#444" },
    todoDate: { fontSize: 12, color: "#95A5A6", marginTop: 4 },
    fab: { position: "absolute", bottom: 90, right: 20, backgroundColor: "#FFD75E", width: 60, height: 60, borderRadius: 30, justifyContent: "center", alignItems: "center", elevation: 5 },
    tabBar: { position: "absolute", bottom: 0, flexDirection: "row", backgroundColor: "white", borderTopWidth: 1, borderTopColor: "#EEE", paddingVertical: 10, width: "100%" },
    tabItem: { flex: 1, alignItems: "center" },
    tabLabel: { fontSize: 10, marginTop: 4, color: "#2F459B" },
});