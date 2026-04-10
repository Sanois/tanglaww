import { supabase } from "@/lib/supabase";
import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Dimensions,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import HamburgerMenu from "./hamburger";

const { width } = Dimensions.get("window");

export default function Homepage() {
  const router = useRouter();
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [studentName, setStudentName] = useState({
    firstName: "",
    lastName: "",
  });
  const [announcements, setAnnouncements] = useState<any[]>([]);

  const fetchAnnouncements = useCallback(async () => {
    const { data } = await supabase
      .from("announcement")
      .select("*")
      .order("createdAt", { ascending: false })
      .limit(3);
    if (data) setAnnouncements(data);
  }, []);

  useEffect(() => {
    const fetchStudent = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("student")
        .select("firstName, lastName")
        .eq("auth_id", user.id)
        .single();

      if (data)
        setStudentName({ firstName: data.firstName, lastName: data.lastName });
    };

    fetchStudent();
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  return (
    <SafeAreaView style={styles.container}>
      <Modal
        animationType="fade"
        transparent={true}
        visible={isMenuVisible}
        onRequestClose={() => setIsMenuVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <HamburgerMenu onClose={() => setIsMenuVisible(false)} />
          <TouchableWithoutFeedback onPress={() => setIsMenuVisible(false)}>
            <View style={styles.clickableOverlay} />
          </TouchableWithoutFeedback>
        </View>
      </Modal>

      <View style={styles.header}>
        <TouchableOpacity
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          onPress={() => setIsMenuVisible(true)}
        >
          <Ionicons name="menu" size={28} color="white" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Dashboard</Text>

        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={() => router.push("/notification")}>
            <Ionicons name="notifications-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.welcomeText}>
          Welcome Back, {studentName.firstName} {studentName.lastName}!
        </Text>

        <View style={styles.carouselContainer}>
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image-outline" size={50} color="#BDC3C7" />
          </View>
          <View style={styles.pagination}>
            <View style={[styles.dot, styles.activeDot]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Continue where you left off...</Text>
        <TouchableOpacity
          style={styles.continueCard}
          activeOpacity={0.7}
          onPress={() => router.push("/courses")}
        >
          <View style={styles.cardInfo}>
            <Text style={styles.sessionLabel}>Recorded Session</Text>
            <Text style={styles.courseTitle}>LET Express</Text>
          </View>
          <Ionicons name="arrow-forward" size={24} color="#2F459B" />
        </TouchableOpacity>

        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons
              name="bullhorn-outline"
              size={22}
              color="#2F459B"
            />
            <Text style={styles.cardTitle}>Announcements</Text>
          </View>
          {announcements.length === 0 ? (
            <Text style={styles.cardBody}>No announcements yet.</Text>
          ) : (
            announcements.map((a, i) => (
              <View
                key={a.id}
                style={
                  i > 0
                    ? {
                        marginTop: 10,
                        borderTopWidth: 1,
                        borderTopColor: "#eee",
                        paddingTop: 10,
                      }
                    : {}
                }
              >
                <Text
                  style={[
                    styles.cardBody,
                    { fontWeight: "bold", color: "#0D2A94" },
                  ]}
                >
                  {a.title}
                </Text>
                <Text style={styles.cardBody}>{a.content}</Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="heart-outline" size={22} color="#2F459B" />
            <Text style={styles.cardTitle}>Daily Affirmation</Text>
          </View>
          <Text style={[styles.cardBody, { fontStyle: "italic" }]}>
            "You're one step closer to your dream, Future LPTs!"
          </Text>
        </View>
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.replace("/homepage")}
        >
          <Ionicons name="home" size={24} color="#FFB800" />
          <Text style={[styles.navText, { color: "#FFB800" }]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/courses")}
        >
          <FontAwesome5 name="graduation-cap" size={20} color="#2F459B" />
          <Text style={styles.navText}>Courses</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/calendar")}
        >
          <Ionicons name="calendar-outline" size={24} color="#2F459B" />
          <Text style={styles.navText}>Calendar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/profile")}
        >
          <Ionicons name="person-outline" size={24} color="#2F459B" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  modalOverlay: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  clickableOverlay: {
    flex: 1,
  },
  header: {
    backgroundColor: "#0D2A94",
    height: Platform.OS === "ios" ? 60 : 70,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 10 : 0,
  },
  headerTitle: { color: "white", fontSize: 20, fontWeight: "bold" },
  headerIcons: { flexDirection: "row", alignItems: "center" },
  scrollContent: { padding: 20, paddingBottom: 100 },
  welcomeText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0D2A94",
    marginBottom: 20,
  },
  carouselContainer: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    marginBottom: 25,
  },
  imagePlaceholder: {
    width: "100%",
    height: 180,
    backgroundColor: "#F2F4F7",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DCDFE3",
    justifyContent: "center",
    alignItems: "center",
  },
  pagination: { flexDirection: "row", justifyContent: "center", marginTop: 15 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#DCDFE3",
    marginHorizontal: 4,
  },
  activeDot: { backgroundColor: "#000", width: 10 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0D2A94",
    marginBottom: 15,
  },
  continueCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#EEE",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardInfo: { flex: 1 },
  sessionLabel: { fontSize: 14, color: "#7F8C8D", marginBottom: 2 },
  courseTitle: { fontSize: 16, fontWeight: "bold", color: "#2F459B" },
  infoCard: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0D2A94",
    marginLeft: 10,
  },
  cardBody: { fontSize: 14, color: "#555", lineHeight: 20 },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 80,
    backgroundColor: "white",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#EEE",
    paddingBottom: Platform.OS === "ios" ? 20 : 0,
  },
  navItem: { alignItems: "center", justifyContent: "center" },
  navText: { fontSize: 12, marginTop: 4, color: "#2F459B", fontWeight: "500" },
});
