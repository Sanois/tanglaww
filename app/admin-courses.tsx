import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

export default function AdminCourses() {
    const router = useRouter();
    const [expandedCourse, setExpandedCourse] = useState<string | null>(null);

    const toggleExpand = (courseTitle: string) => {
        setExpandedCourse(expandedCourse === courseTitle ? null : courseTitle);
    };

    const CourseCard = ({ title, instructor, isLocked, hasDropdown, progress }: any) => {
        const isExpanded = expandedCourse === title;
        // Check if this is the onboarding course to limit dropdown items
        const isOnboarding = title.includes("On Boarding");

        return (
            <View style={styles.cardContainer}>
                <TouchableOpacity 
                    activeOpacity={0.7} 
                    style={styles.courseCard}
                    onPress={() => hasDropdown && !isLocked && toggleExpand(title)}
                >
                    <View style={styles.imagePlaceholder}>
                        <View style={styles.progressBadge}>
                            <View style={[
                                styles.progressCircle, 
                                { borderColor: progress === "100%" ? "#2ECC71" : "#BDC3C7" }
                            ]} />
                            <Text style={styles.progressText}>{progress || "0%"}</Text>
                        </View>

                        {isLocked ? (
                            <View style={styles.lockOverlay}>
                                <Ionicons name="lock-closed" size={40} color="black" />
                            </View>
                        ) : (
                            <Ionicons name="image-outline" size={40} color="#CCC" />
                        )}
                    </View>
                    
                    <View style={styles.cardFooter}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.courseTitle}>{title}</Text>
                            <Text style={styles.instructorText}>{instructor}</Text>
                            {isLocked && (
                                <Text style={styles.lockedNote}>This course is currently locked</Text>
                            )}
                        </View>
                        {hasDropdown && !isLocked && (
                            <Ionicons 
                                name={isExpanded ? "chevron-up" : "chevron-down"} 
                                size={24} 
                                color="#2F459B" 
                            />
                        )}
                    </View>
                </TouchableOpacity>

                {isExpanded && !isLocked && (
                    <View style={styles.dropdownContent}>
                        {/* 1. Handouts - Navigation to your materials folder */}
                        <TouchableOpacity 
                            style={styles.dropItem}
                            onPress={() => router.push({
                                pathname: "/materials/handout",
                                params: { courseTitle: title }
                            })}
                        >
                            <Ionicons name="document-text-outline" size={20} color="#2F459B" />
                            <Text style={styles.dropText}>Handouts</Text>
                        </TouchableOpacity>

                        {/* 2. Recorded Sessions */}
                        <TouchableOpacity style={styles.dropItem}>
                            <Ionicons name="videocam-outline" size={20} color="#2F459B" />
                            <Text style={styles.dropText}>Recorded Sessions</Text>
                        </TouchableOpacity>

                        {/* Conditional Items: Only show if NOT Onboarding */}
                        {!isOnboarding && (
                            <>
                                <TouchableOpacity style={styles.dropItem}>
                                    <Ionicons name="bulb-outline" size={20} color="#2F459B" />
                                    <Text style={styles.dropText}>Quiz</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.dropItem}>
                                    <Ionicons name="share-outline" size={20} color="#2F459B" />
                                    <Text style={styles.dropText}>Online Session Link</Text>
                                </TouchableOpacity>
                            </>
                        )}

                        {/* Admin-only "Add" action */}
                        <TouchableOpacity style={[styles.dropItem, { borderBottomWidth: 0 }]}>
                            <Ionicons name="add-circle-outline" size={20} color="#BDC3C7" />
                            <Text style={[styles.dropText, { color: "#BDC3C7" }]}>Add new section</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity>
                    <Ionicons name="menu" size={28} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Courses</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <CourseCard 
                    title="LET On Boarding (Concept-Driven)" 
                    instructor="Mr. Ruel Atun"
                    hasDropdown={true}
                    progress="100%" 
                />
                <CourseCard 
                    title="LET Express" 
                    instructor="Mr. Ruel Atun"
                    hasDropdown={true}
                    progress="70%"
                />
                <CourseCard 
                    title="LET Advanced" 
                    instructor="Mr. Ruel Atun"
                    hasDropdown={true}
                    progress="0%"
                />
                <CourseCard 
                    title="Integrative" 
                    instructor="Mr. Ruel Atun"
                    isLocked={true}
                    progress="0%"
                />
            </ScrollView>

            {/* Bottom Tab Bar remains the same */}
            <View style={styles.tabBar}>
                <TouchableOpacity style={styles.tabItem} onPress={() => router.push("/admin-dashboard")}>
                    <Ionicons name="home-outline" size={24} color="#2F459B" />
                    <Text style={styles.tabLabel}>Home</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabItem} onPress={() => router.push("/admin-approval")}>
                    <Ionicons name="person-outline" size={24} color="#2F459B" />
                    <Text style={styles.tabLabel}>Approvals</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabItem} onPress={() => router.push("/admin-calendar")}>
                    <Ionicons name="calendar-outline" size={24} color="#2F459B" />
                    <Text style={styles.tabLabel}>Calendar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabItem}>
                    <Ionicons name="school" size={24} color="#FFD75E" />
                    <Text style={[styles.tabLabel, { color: "#FFD75E" }]}>Courses</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "white" },
    header: { backgroundColor: "#FFD75E", flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 15 },
    headerTitle: { fontSize: 22, fontWeight: "bold", color: "black", marginLeft: 20 },
    scrollContent: { padding: 20, paddingBottom: 100 },
    cardContainer: { marginBottom: 20, borderRadius: 12, overflow: 'hidden', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, backgroundColor: 'white', borderWidth: 1, borderColor: '#EEE' },
    courseCard: { backgroundColor: "white" },
    imagePlaceholder: { width: "100%", height: 120, backgroundColor: "#F8F9FA", justifyContent: "center", alignItems: "center" },
    lockOverlay: { width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.05)', justifyContent: 'center', alignItems: 'center' },
    progressBadge: { position: 'absolute', top: 10, left: 10, zIndex: 10, flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: '#DDD' },
    progressCircle: { width: 12, height: 12, borderRadius: 6, borderWidth: 2, marginRight: 5 },
    progressText: { fontSize: 10, fontWeight: 'bold', color: '#555' },
    cardFooter: { padding: 15, flexDirection: 'row', alignItems: 'center' },
    courseTitle: { fontSize: 16, fontWeight: "bold", color: "black" },
    instructorText: { fontSize: 13, color: "#777", marginTop: 2 },
    lockedNote: { fontSize: 11, color: "#E74C3C", marginTop: 4, fontStyle: 'italic' },
    dropdownContent: { backgroundColor: "#F0F2F8", paddingHorizontal: 15, paddingBottom: 10, borderTopWidth: 1, borderTopColor: '#EEE' },
    dropItem: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#E0E0E0" },
    dropText: { fontSize: 14, color: "#2F459B", fontWeight: "500", marginLeft: 15, textDecorationLine: 'underline' },
    tabBar: { position: "absolute", bottom: 0, flexDirection: "row", backgroundColor: "white", borderTopWidth: 1, borderTopColor: "#EEE", paddingVertical: 10, width: "100%" },
    tabItem: { flex: 1, alignItems: "center" },
    tabLabel: { fontSize: 10, marginTop: 4, color: "#2F459B" },
});