import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AdminHamburger from "./hamburger";

const { width } = Dimensions.get("window");
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function AdminCalendar() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Upcoming");
  const [menuVisible, setMenuVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<any[]>([]);
  const [todos, setTodos] = useState<any[]>([]);
  const tabSlideAnim = useRef(new Animated.Value(0)).current;

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(today.getDate());

  const fetchData = useCallback(async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: eventData } = await supabase
      .from("calendar_events")
      .select("*")
      .order("event_date", { ascending: true });

    const { data: todoData } = await supabase
      .from("admin_todo")
      .select("*")
      .eq("admin_id", user.id)
      .order("event_date", { ascending: true });

    setEvents(eventData ?? []);
    setTodos(todoData ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleToggleTodo = async (todo: any) => {
    const { error } = await supabase
      .from("admin_todo")
      .update({ is_completed: !todo.is_completed })
      .eq("id", todo.id);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }
    fetchData();
  };

  const handleDeleteTodo = async (id: number) => {
    Alert.alert("Delete Task", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await supabase.from("admin_todo").delete().eq("id", id);
          fetchData();
        },
      },
    ]);
  };

  const handleDeleteEvent = async (id: number) => {
    Alert.alert(
      "Delete Event",
      "This will remove it from all students calendars. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await supabase.from("calendar_events").delete().eq("id", id);
            fetchData();
          },
        },
      ],
    );
  };

  const handleTabChange = (tabName: string, index: number) => {
    setActiveTab(tabName);
    Animated.spring(tabSlideAnim, {
      toValue: index * ((width - 40) / 2),
      useNativeDriver: false,
      friction: 10,
      tension: 50,
    }).start();
  };

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const offset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else setCurrentMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else setCurrentMonth((m) => m + 1);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const hasEvent = (day: number) =>
    events.some((e) => {
      const d = new Date(e.event_date);
      return (
        d.getDate() === day &&
        d.getMonth() === currentMonth &&
        d.getFullYear() === currentYear
      );
    });

  const hasTodo = (day: number) =>
    todos.some((t) => {
      if (!t.event_date) return false;
      const d = new Date(t.event_date);
      return (
        d.getDate() === day &&
        d.getMonth() === currentMonth &&
        d.getFullYear() === currentYear
      );
    });

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

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.monthHeader}>
          <TouchableOpacity onPress={prevMonth}>
            <Ionicons name="chevron-back" size={24} color="#2F459B" />
          </TouchableOpacity>
          <Text style={styles.monthText}>
            {MONTHS[currentMonth]} {currentYear}
          </Text>
          <TouchableOpacity onPress={nextMonth}>
            <Ionicons name="chevron-forward" size={24} color="#2F459B" />
          </TouchableOpacity>
        </View>

        <View style={styles.calendarGrid}>
          {DAYS.map((day) => (
            <Text key={day} style={styles.dayLabel}>
              {day}
            </Text>
          ))}
          {[...Array(offset)].map((_, i) => (
            <View key={`empty-${i}`} style={styles.dateBox} />
          ))}
          {[...Array(daysInMonth)].map((_, i) => {
            const day = i + 1;
            const isSelected =
              day === selectedDate &&
              currentMonth === today.getMonth() &&
              currentYear === today.getFullYear();
            return (
              <TouchableOpacity
                key={day}
                style={[styles.dateBox, isSelected && styles.selectedDate]}
                onPress={() => setSelectedDate(day)}
              >
                <Text
                  style={[
                    styles.dateText,
                    isSelected && styles.selectedDateText,
                  ]}
                >
                  {day}
                </Text>
                <View style={styles.dotRow}>
                  {hasEvent(day) && (
                    <View
                      style={[styles.calDot, { backgroundColor: "#2F459B" }]}
                    />
                  )}
                  {hasTodo(day) && (
                    <View
                      style={[styles.calDot, { backgroundColor: "#FFD75E" }]}
                    />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.calDot, { backgroundColor: "#2F459B" }]} />
            <Text style={styles.legendText}>Event</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.calDot, { backgroundColor: "#FFD75E" }]} />
            <Text style={styles.legendText}>Todo</Text>
          </View>
        </View>

        <View style={styles.tabWrapper}>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={styles.tab}
              onPress={() => handleTabChange("Upcoming", 0)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "Upcoming" && styles.activeTabText,
                ]}
              >
                Upcoming Events
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.tab}
              onPress={() => handleTabChange("ToDo", 1)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "ToDo" && styles.activeTabText,
                ]}
              >
                To Do List
              </Text>
            </TouchableOpacity>
          </View>
          <Animated.View style={[styles.underline, { left: tabSlideAnim }]} />
        </View>

        <View style={styles.listContainer}>
          {loading ? (
            <ActivityIndicator color="#2F459B" />
          ) : activeTab === "Upcoming" ? (
            <>
              {events.length === 0 ? (
                <Text style={styles.emptyText}>
                  No upcoming events yet. Tap + to add one!
                </Text>
              ) : (
                events.map((event) => (
                  <View key={event.id} style={styles.eventCard}>
                    <TouchableOpacity
                      style={styles.eventInfo}
                      onPress={() => event.link && Linking.openURL(event.link)}
                    >
                      <Text style={styles.eventTitle}>{event.title}</Text>
                      {event.description && (
                        <Text style={styles.eventDesc}>
                          {event.description}
                        </Text>
                      )}
                      {event.link && (
                        <Text style={styles.eventLink} numberOfLines={1}>
                          {event.link}
                        </Text>
                      )}
                    </TouchableOpacity>
                    <View style={styles.eventRight}>
                      <View style={styles.eventDateTime}>
                        <Text style={styles.eventDate}>
                          {formatDate(event.event_date)}
                        </Text>
                        <Text style={styles.eventTime}>
                          {formatTime(event.event_date)}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleDeleteEvent(event.id)}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={18}
                          color="#e74c3c"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </>
          ) : (
            <>
              {todos.length === 0 ? (
                <Text style={styles.emptyText}>
                  No tasks yet. Tap + to add one!
                </Text>
              ) : (
                todos.map((todo) => (
                  <View
                    key={todo.id}
                    style={[
                      styles.todoCard,
                      todo.is_completed && { opacity: 0.6 },
                    ]}
                  >
                    <TouchableOpacity onPress={() => handleToggleTodo(todo)}>
                      <Ionicons
                        name={todo.is_completed ? "checkbox" : "square-outline"}
                        size={24}
                        color="#2F459B"
                      />
                    </TouchableOpacity>
                    <View style={styles.todoTextContainer}>
                      <Text
                        style={[
                          styles.todoTitle,
                          todo.is_completed && {
                            textDecorationLine: "line-through",
                            color: "#999",
                          },
                        ]}
                      >
                        {todo.title}
                      </Text>
                      {todo.event_date && (
                        <Text style={styles.todoDate}>
                          {formatDate(todo.event_date)}{" "}
                          {formatTime(todo.event_date)}
                        </Text>
                      )}
                    </View>
                    <TouchableOpacity onPress={() => handleDeleteTodo(todo.id)}>
                      <Ionicons
                        name="trash-outline"
                        size={18}
                        color="#e74c3c"
                      />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          if (activeTab === "Upcoming") {
            router.push("/admin/add-event" as any);
          } else {
            router.push("/admin/todo" as any);
          }
        }}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push("/admin/dashboard")}
        >
          <Ionicons name="home-outline" size={24} color="#2F459B" />
          <Text style={styles.tabLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push("/admin/approval")}
        >
          <Ionicons name="person-outline" size={24} color="#2F459B" />
          <Text style={styles.tabLabel}>Approvals</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="calendar" size={24} color="#FFD75E" />
          <Text style={[styles.tabLabel, { color: "#FFD75E" }]}>Calendar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push("/admin/courses")}
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
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "black" },
  scrollContent: { paddingBottom: 120 },
  monthHeader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 25,
  },
  monthText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2F459B",
    marginHorizontal: 40,
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  dayLabel: {
    width: (width - 30) / 7,
    textAlign: "center",
    color: "#BDC3C7",
    fontSize: 13,
    marginBottom: 15,
    fontWeight: "500",
  },
  dateBox: {
    width: (width - 30) / 7,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
  dateText: { color: "#2F459B", fontSize: 15 },
  selectedDate: { backgroundColor: "#FFD75E", borderRadius: 25 },
  selectedDateText: { fontWeight: "bold", color: "#2F459B" },
  dotRow: { flexDirection: "row", gap: 2, marginTop: 2 },
  calDot: { width: 5, height: 5, borderRadius: 3 },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginBottom: 15,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendText: { fontSize: 11, color: "#666" },
  tabWrapper: {
    marginHorizontal: 20,
    marginTop: 10,
    backgroundColor: "#FFD75E",
    borderRadius: 12,
    height: 50,
    position: "relative",
  },
  tabContainer: { flexDirection: "row", width: "100%", height: "100%" },
  tab: { flex: 1, justifyContent: "center", alignItems: "center" },
  underline: {
    position: "absolute",
    bottom: 0,
    height: 4,
    width: (width - 40) / 2,
    backgroundColor: "white",
    borderRadius: 2,
  },
  tabText: { fontWeight: "bold", color: "rgba(47, 69, 155, 0.6)" },
  activeTabText: { color: "#2F459B" },
  listContainer: { padding: 20 },
  emptyText: {
    color: "#999",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 20,
  },
  eventCard: {
    flexDirection: "row",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EEE",
    marginBottom: 12,
  },
  eventInfo: { flex: 1 },
  eventTitle: { fontSize: 16, fontWeight: "bold", color: "#444" },
  eventDesc: { fontSize: 12, color: "#777", marginTop: 3 },
  eventLink: {
    fontSize: 11,
    color: "#2F459B",
    textDecorationLine: "underline",
    marginTop: 4,
  },
  eventRight: { alignItems: "flex-end", justifyContent: "space-between" },
  eventDateTime: { alignItems: "flex-end" },
  eventDate: { fontSize: 12, fontWeight: "bold", color: "#7F8C8D" },
  eventTime: { fontSize: 12, color: "#95A5A6" },
  todoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EEE",
    marginBottom: 12,
    gap: 10,
  },
  todoTextContainer: { flex: 1 },
  todoTitle: { fontSize: 16, fontWeight: "bold", color: "#444" },
  todoDate: { fontSize: 12, color: "#95A5A6", marginTop: 4 },
  fab: {
    position: "absolute",
    bottom: 90,
    right: 20,
    backgroundColor: "#FFD75E",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
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
