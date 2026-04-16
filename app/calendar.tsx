import { supabase } from "@/lib/supabase";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Linking,
  Modal,
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

export default function CalendarScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Events");
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<any[]>([]);
  const [todos, setTodos] = useState<any[]>([]);

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(today.getDate());

  const fetchData = useCallback(async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }
    const { data: eventData } = await supabase
      .from("calendar_events")
      .select("*")
      .order("event_date", { ascending: true });

    const { data: studentData } = await supabase
      .from("student")
      .select("id")
      .eq("email", user.email)
      .single();

    if (studentData) {
      const { data: todoData } = await supabase
        .from("to_do")
        .select("*")
        .eq("student_id", studentData.id)
        .order("dueDate", { ascending: true });

      setTodos(todoData ?? []);
    }

    setEvents(eventData ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleToggleTodo = async (todo: any) => {
    const isCompleted = !todo.isCompleted;

    setTodos((prev) =>
      prev.map((t) => (t.todo_id === todo.todo_id ? { ...t, isCompleted } : t)),
    );

    const { error } = await supabase
      .from("to_do")
      .update({
        isCompleted: isCompleted,
        completedAt: isCompleted ? new Date().toISOString() : null,
      })
      .eq("todo_id", todo.todo_id);

    if (error) {
      Alert.alert("Error", error.message);
      setTodos((prev) =>
        prev.map((t) =>
          t.todo_id === todo.todo_id ? { ...t, isCompleted: !isCompleted } : t,
        ),
      );
    }
  };

  const handleDeleteTodo = async (id: number) => {
    Alert.alert("Delete Todo", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await supabase.from("to_do").delete().eq("todo_id", id);
          fetchData();
        },
      },
    ]);
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

  const formatEventDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatEventTime = (dateStr: string) => {
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
      if (!t.dueDate) return false;
      const d = new Date(t.dueDate);
      return (
        d.getDate() === day &&
        d.getMonth() === currentMonth &&
        d.getFullYear() === currentYear
      );
    });

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
        <TouchableOpacity onPress={() => setIsMenuVisible(true)}>
          <Ionicons name="menu" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Calendar</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.monthHeader}>
          <TouchableOpacity onPress={prevMonth}>
            <Ionicons name="chevron-back" size={20} color="#0D2A94" />
          </TouchableOpacity>
          <Text style={styles.monthTitle}>
            {MONTHS[currentMonth]} {currentYear}
          </Text>
          <TouchableOpacity onPress={nextMonth}>
            <Ionicons name="chevron-forward" size={20} color="#0D2A94" />
          </TouchableOpacity>
        </View>

        <View style={{ paddingHorizontal: 10 }}></View>
        <View style={styles.calendarGrid}>
          {DAYS.map((day) => (
            <Text
              key={`day-${currentYear}-${currentMonth}-${day}`}
              style={styles.dayLabel}
            >
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
            const isToday =
              day === today.getDate() &&
              currentMonth === today.getMonth() &&
              currentYear === today.getFullYear();
            return (
              <TouchableOpacity
                key={`day-${currentYear}-${currentMonth}-${day}`}
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
                      key={`event-dot-${day}`}
                      style={[styles.calDot, { backgroundColor: "#0D2A94" }]}
                    />
                  )}
                  {hasTodo(day) && (
                    <View
                      key={`todo-dot-${day}`}
                      style={[styles.calDot, { backgroundColor: "#FFB800" }]}
                    />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.calDot, { backgroundColor: "#0D2A94" }]} />
            <Text style={styles.legendText}>Event</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.calDot, { backgroundColor: "#FFB800" }]} />
            <Text style={styles.legendText}>Todo</Text>
          </View>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "Events" && styles.activeTab]}
            onPress={() => setActiveTab("Events")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "Events" && styles.activeTabText,
              ]}
            >
              Upcoming Events
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "To Do" && styles.activeTab]}
            onPress={() => setActiveTab("To Do")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "To Do" && styles.activeTabText,
              ]}
            >
              To Do List
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.eventSection}>
          {loading ? (
            <ActivityIndicator color="#0D2A94" />
          ) : activeTab === "Events" ? (
            events.length === 0 ? (
              <Text style={styles.emptyText}>No upcoming events</Text>
            ) : (
              events.map((event) => (
                <TouchableOpacity
                  key={event.event_id}
                  style={styles.eventCard}
                  onPress={() => event.link && Linking.openURL(event.link)}
                >
                  <View style={styles.eventInfo}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    {event.description && (
                      <Text style={styles.eventDesc}>{event.description}</Text>
                    )}
                    {event.link && (
                      <Text style={styles.eventLink} numberOfLines={1}>
                        {event.link}
                      </Text>
                    )}
                  </View>
                  <View style={styles.eventTimeContainer}>
                    <Text style={styles.eventDate}>
                      {formatEventDate(event.event_date)}
                    </Text>
                    <Text style={styles.eventTime}>
                      {formatEventTime(event.event_date)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )
          ) : todos.length === 0 ? (
            <Text style={styles.emptyText}>
              No todos yet. Tap + to add one!
            </Text>
          ) : (
            todos.map((todo) => (
              <View
                key={`todo-${todo.todo_id}`}
                style={[
                  styles.todoCard,
                  todo.isCompleted && styles.todoCompleted,
                ]}
              >
                <TouchableOpacity
                  style={styles.todoCheckbox}
                  onPress={() => handleToggleTodo(todo)}
                >
                  <Ionicons
                    name={todo.isCompleted ? "checkbox" : "square-outline"}
                    size={24}
                    color="#0D2A94"
                  />
                </TouchableOpacity>
                <View style={styles.todoTextContainer}>
                  <Text
                    style={[
                      styles.todoTitle,
                      todo.isCompleted && styles.todoTitleDone,
                    ]}
                  >
                    {todo.title}
                  </Text>
                  {todo.description && (
                    <Text style={styles.todoDesc}>{todo.description}</Text>
                  )}
                  {todo.dueDate && (
                    <Text style={styles.todoDate}>
                      Due: {formatEventDate(todo.dueDate)}{" "}
                      {formatEventTime(todo.dueDate)}
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  onPress={() => handleDeleteTodo(todo.todo_id)}
                >
                  <Ionicons name="trash-outline" size={20} color="#e74c3c" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/add-todo")}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>

      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.replace("/homepage")}
        >
          <Ionicons name="home-outline" size={24} color="#2F459B" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.replace("/courses")}
        >
          <FontAwesome5 name="graduation-cap" size={20} color="#2F459B" />
          <Text style={styles.navText}>Courses</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="calendar" size={24} color="#FFB800" />
          <Text style={[styles.navText, { color: "#FFB800" }]}>Calendar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.replace("/profile")}
        >
          <Ionicons name="person-outline" size={24} color="#2F459B" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  modalOverlay: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  clickableOverlay: { flex: 1 },
  header: {
    backgroundColor: "#0D2A94",
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  headerTitle: { color: "white", fontSize: 20, fontWeight: "bold" },
  scrollContent: { paddingBottom: 100 },
  monthHeader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0D2A94",
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
  dateText: { color: "#2F459B", fontSize: 14 },
  selectedDate: {
    backgroundColor: "#FFD75E",
    borderRadius: 25,
  },
  selectedDateText: {
    fontWeight: "bold",
    color: "#2F459B",
  },
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

  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#0D2A94",
    marginHorizontal: 15,
    borderRadius: 10,
    overflow: "hidden",
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center" },
  activeTab: { borderBottomWidth: 4, borderBottomColor: "white" },
  tabText: { color: "rgba(255,255,255,0.6)", fontWeight: "bold" },
  activeTabText: { color: "white" },

  eventSection: { padding: 20 },
  emptyText: {
    color: "#999",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 20,
  },

  eventCard: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#DCDFE3",
  },
  eventInfo: { flex: 1 },
  eventTitle: { fontSize: 16, fontWeight: "bold", color: "#555" },
  eventDesc: { fontSize: 12, color: "#777", marginTop: 3 },
  eventLink: {
    fontSize: 10,
    color: "#2F459B",
    textDecorationLine: "underline",
    marginTop: 5,
  },
  eventTimeContainer: { alignItems: "flex-end", justifyContent: "center" },
  eventDate: { fontSize: 12, color: "#7F8C8D" },
  eventTime: { fontSize: 12, fontWeight: "bold", color: "#7F8C8D" },

  todoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#DCDFE3",
  },
  todoCompleted: { opacity: 0.6, backgroundColor: "#f9f9f9" },
  todoCheckbox: { marginRight: 10 },
  todoTextContainer: { flex: 1 },
  todoTitle: { fontSize: 16, fontWeight: "bold", color: "#555" },
  todoTitleDone: { textDecorationLine: "line-through", color: "#999" },
  todoDesc: { fontSize: 12, color: "#777", marginTop: 3 },
  todoDate: { fontSize: 12, color: "#7F8C8D", marginTop: 4 },

  fab: {
    position: "absolute",
    right: 20,
    bottom: 100,
    backgroundColor: "#FFB800",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 70,
    backgroundColor: "white",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#EEE",
  },
  navItem: { alignItems: "center" },
  navText: { fontSize: 12, marginTop: 4, color: "#2F459B" },
});
