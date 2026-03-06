import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function AdminApproval() {
  const router = useRouter();

  const ApprovalCard = ({ name, course, id }: { name: string; course: string; id: string }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => router.push(`/registrant/${id}` as any)}
    >
      <View style={styles.avatarCircle}>
        <Ionicons name="person-outline" size={20} color="#555" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.nameText}>{name}</Text>
        <Text style={styles.courseText}>{course}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#CCC" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="menu" size={28} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Approvals</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Pending</Text>
        <ApprovalCard 
          id="placeholder-1" 
          name="Placeholder 1" 
          course="Bachelor of Elementary Education" 
        />
        <ApprovalCard 
          id="placeholder-2" 
          name="Placeholder 2" 
          course="Bachelor of Secondary Education" 
        />

        <Text style={styles.sectionTitle}>Approved</Text>
        <ApprovalCard 
          id="placeholder-3" 
          name="Placeholder 3" 
          course="Bachelor of Elementary Education" 
        />
        <ApprovalCard 
          id="placeholder-4" 
          name="Placeholder 4" 
          course="Bachelor of Elementary Education" 
        />

        <Text style={styles.sectionTitle}>Rejected</Text>
        <ApprovalCard 
          id="placeholder-5" 
          name="Placeholder 5" 
          course="Bachelor of Secondary Education" 
        />
        
        <View style={{ height: 100 }} /> 
      </ScrollView>

      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={styles.tabItem} 
          onPress={() => router.push("/admin-dashboard")}
        >
          <Ionicons name="home-outline" size={24} color="#2F459B" />
          <Text style={styles.tabLabel}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="person" size={24} color="#FFD75E" />
          <Text style={[styles.tabLabel, { color: "#FFD75E" }]}>Approvals</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.tabItem}
          onPress={() => router.push("/admin-calendar")}
        >
          <Ionicons name="calendar-outline" size={24} color="#2F459B" />
          <Text style={styles.tabLabel}>Calendar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.tabItem}
          onPress={() => router.push("/admin-courses")}
        >
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
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "black", marginLeft: 20 },
  content: { paddingHorizontal: 20, paddingTop: 10 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#2F459B", marginTop: 20, marginBottom: 10 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2F459B",
    marginBottom: 10,
  },
  avatarCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#F0F0F0", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#CCC" },
  textContainer: { flex: 1, marginLeft: 15 },
  nameText: { fontSize: 15, fontWeight: "bold", color: "#2F459B" },
  courseText: { fontSize: 12, color: "#777" },
  tabBar: {
    position: "absolute",
    bottom: 0,
    flexDirection: "row",
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#EEE",
    paddingVertical: 10,
    width: "100%",
  },
  tabItem: { flex: 1, alignItems: "center" },
  tabLabel: { fontSize: 10, marginTop: 4, color: "#2F459B" },
});