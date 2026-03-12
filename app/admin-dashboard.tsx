import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

export default function AdminDashboard() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity>
                    <Ionicons name="menu" size={28} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Dashboard</Text>
                <View style={styles.headerIcons}>
                    {/* Search removed, added navigation to the new notification screen */}
                    <TouchableOpacity onPress={() => router.push("/admin-notification")}>
                        <Ionicons name="notifications-outline" size={24} color="black" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.welcomeText}>Welcome Back!</Text>

                <View style={styles.heroCard}>
                    <View style={styles.imagePlaceholder}>
                        <Ionicons name="image-outline" size={40} color="#CCC" />
                        <TouchableOpacity style={styles.editIconHero}>
                            <Ionicons name="pencil-outline" size={16} color="black" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.paginationDots}>
                        <View style={[styles.dot, styles.activeDot]} />
                        <View style={styles.dot} />
                        <View style={styles.dot} />
                        <View style={styles.dot} />
                    </View>
                </View>

                <View style={styles.infoCard}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="megaphone-outline" size={20} color="#2F459B" />
                        <Text style={styles.cardTitle}>Announcements</Text>
                        <TouchableOpacity onPress={() => router.push("/admin-notification")}>
                            <Ionicons name="pencil-outline" size={18} color="#555" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.cardBody}>
                        March 2026 LET Review: Enrollment is Open! Join our LET Onboarding
                        now. You can secure your slot with an initial payment of just P1,000.
                    </Text>
                </View>

                <View style={styles.affirmationCard}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="heart-outline" size={20} color="#2F459B" />
                        <Text style={styles.cardTitle}>Daily Affirmation</Text>
                    </View>
                    <Text style={styles.affirmationText}>
                        "The secret of getting ahead is getting started."
                    </Text>
                </View>

                <View style={styles.sectionRow}>
                    <Text style={styles.sectionTitle}>Approval Stream</Text>
                    <TouchableOpacity onPress={() => router.push("/admin-approval")}>
                        <Text style={styles.seeAllText}>See all</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity 
                    style={styles.approvalItem}
                    onPress={() => router.push("/admin-approval")}
                >
                    <View style={styles.avatarCircle}>
                        <Ionicons name="person-outline" size={20} color="#555" />
                    </View>
                    <View style={styles.approvalTextContainer}>
                        <Text style={styles.approvalName}>New registree!</Text>
                        <Text style={styles.approvalSub}>Lorem ipsum dolor sit amet</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="#CCC" />
                </TouchableOpacity>
            </ScrollView>

            <View style={styles.tabBar}>
                <TouchableOpacity style={styles.tabItem} onPress={() => router.push("/admin-dashboard")}>
                    <Ionicons name="home" size={24} color="#FFD75E" />
                    <Text style={[styles.tabLabel, { color: "#FFD75E" }]}>Home</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.tabItem} onPress={() => router.push("/admin-approval")}>
                    <Ionicons name="person-outline" size={24} color="#2F459B" />
                    <Text style={styles.tabLabel}>Approvals</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.tabItem} onPress={() => router.push("/admin-calendar")}>
                    <Ionicons name="calendar-outline" size={24} color="#2F459B" />
                    <Text style={styles.tabLabel}>Calendar</Text>
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
    header: {
        backgroundColor: "#FFD75E",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 15,
        justifyContent: "space-between",
    },
    headerTitle: { fontSize: 20, fontWeight: "bold", color: "black", flex: 1, marginLeft: 20 },
    headerIcons: { flexDirection: "row" },
    scrollContent: { paddingHorizontal: 20 },
    welcomeText: { fontSize: 22, fontWeight: "bold", color: "#2F459B", marginVertical: 20 },
    affirmationCard: {
        backgroundColor: "white",
        borderRadius: 15,
        padding: 15,
        borderWidth: 1,
        borderColor: "#EEE",
        marginBottom: 20,
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
    },
    affirmationText: { fontSize: 14, fontStyle: 'italic', color: "#555", marginTop: 5, textAlign: 'center' },
    heroCard: {
        backgroundColor: "white",
        borderRadius: 15,
        padding: 15,
        borderWidth: 1,
        borderColor: "#EEE",
        alignItems: "center",
        marginBottom: 20,
    },
    imagePlaceholder: {
        width: "100%",
        height: 150,
        backgroundColor: "#F8F9FA",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#2F459B",
        justifyContent: "center",
        alignItems: "center",
    },
    editIconHero: { position: "absolute", top: 10, right: 10 },
    paginationDots: { flexDirection: "row", marginTop: 10 },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#CCC", marginHorizontal: 3 },
    activeDot: { backgroundColor: "#555" },
    infoCard: {
        backgroundColor: "white",
        borderRadius: 15,
        padding: 15,
        borderWidth: 1,
        borderColor: "#EEE",
        marginBottom: 15,
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
    },
    cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
    cardTitle: { flex: 1, marginLeft: 10, fontSize: 16, fontWeight: "bold", color: "#2F459B" },
    cardBody: { fontSize: 13, color: "#555", lineHeight: 18 },
    sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginTop: 10, marginBottom: 15 },
    sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#2F459B" },
    seeAllText: { color: "#2F459B", fontSize: 14 },
    approvalItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "white",
        padding: 15,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: "#EEE",
        marginBottom: 80,
    },
    avatarCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#F0F0F0", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#CCC" },
    approvalTextContainer: { flex: 1, marginLeft: 15 },
    approvalName: { fontSize: 16, fontWeight: "bold", color: "#2F459B" },
    approvalSub: { fontSize: 12, color: "#777" },
    tabBar: {
        position: "absolute",
        bottom: 0,
        flexDirection: "row",
        backgroundColor: "white",
        borderTopWidth: 1,
        borderTopColor: "#EEE",
        paddingVertical: 10,
        width: '100%'
    },
    tabItem: { flex: 1, alignItems: "center" },
    tabLabel: { fontSize: 10, marginTop: 4, color: "#2F459B" },
});