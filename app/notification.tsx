import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface CalendarEvent {
  event_id: number;
  title: string;
  description: string | null;
  event_date: string;
  link: string | null;
  created_at: string;
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

const isToday = (iso: string) => {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
};

const isYesterday = (iso: string) => {
  const d = new Date(iso);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return (
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear()
  );
};

export default function StudentNotifications() {
  const router = useRouter();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from("calendar_events")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) setEvents(data as CalendarEvent[]);
      setLoading(false);
    };
    fetchEvents();
  }, []);

  const todayEvents = events.filter((e) => isToday(e.created_at));
  const yesterdayEvents = events.filter((e) => isYesterday(e.created_at));
  const olderEvents = events.filter(
    (e) => !isToday(e.created_at) && !isYesterday(e.created_at),
  );

  const openModal = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setModalVisible(true);
  };

  const NotificationItem = ({ event }: { event: CalendarEvent }) => (
    <TouchableOpacity
      style={styles.notificationCard}
      onPress={() => openModal(event)}
    >
      <View style={styles.iconContainer}>
        <View style={styles.iconCircle}>
          <Ionicons name="calendar-outline" size={20} color="#2F459B" />
        </View>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.notiTitle}>{event.title}</Text>
        {event.description && (
          <Text style={styles.notiDescription} numberOfLines={1}>
            {event.description}
          </Text>
        )}
      </View>
      <View style={styles.dateTimeContainer}>
        <Text style={styles.notiDate}>{formatDate(event.event_date)}</Text>
        <Text style={styles.notiTime}>{formatTime(event.event_date)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2F459B" />
        </View>
      ) : events.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="notifications-off-outline" size={48} color="#DDD" />
          <Text style={styles.emptyText}>No notifications yet</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {todayEvents.length > 0 && (
            <>
              <Text style={styles.sectionHeader}>Today</Text>
              {todayEvents.map((e) => (
                <NotificationItem key={e.event_id} event={e} />
              ))}
            </>
          )}

          {yesterdayEvents.length > 0 && (
            <>
              <Text style={[styles.sectionHeader, { marginTop: 10 }]}>
                Yesterday
              </Text>
              {yesterdayEvents.map((e) => (
                <NotificationItem key={e.event_id} event={e} />
              ))}
            </>
          )}

          {olderEvents.length > 0 && (
            <>
              <Text style={[styles.sectionHeader, { marginTop: 10 }]}>
                Earlier
              </Text>
              {olderEvents.map((e) => (
                <NotificationItem key={e.event_id} event={e} />
              ))}
            </>
          )}
        </ScrollView>
      )}

      <Modal visible={modalVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View
            style={styles.eventModal}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.eventModalHeader}>
              <View style={styles.eventModalIconWrap}>
                <Ionicons name="calendar" size={22} color="#2F459B" />
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#555" />
              </TouchableOpacity>
            </View>

            <Text style={styles.eventModalTitle}>{selectedEvent?.title}</Text>

            <View style={styles.eventModalRow}>
              <Ionicons name="time-outline" size={16} color="#2F459B" />
              <Text style={styles.eventModalMeta}>
                {selectedEvent ? formatDate(selectedEvent.event_date) : ""}
                {" · "}
                {selectedEvent ? formatTime(selectedEvent.event_date) : ""}
              </Text>
            </View>

            {selectedEvent?.description && (
              <View style={styles.eventModalDescBox}>
                <Text style={styles.eventModalDescLabel}>Description</Text>
                <Text style={styles.eventModalDesc}>
                  {selectedEvent.description}
                </Text>
              </View>
            )}

            {selectedEvent?.link && (
              <TouchableOpacity
                style={styles.eventModalLinkBtn}
                onPress={() =>
                  selectedEvent.link && Linking.openURL(selectedEvent.link)
                }
              >
                <Ionicons name="link-outline" size={16} color="#2F459B" />
                <Text style={styles.eventModalLinkText} numberOfLines={1}>
                  {selectedEvent.link}
                </Text>
                <Ionicons name="open-outline" size={14} color="#2F459B" />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.eventModalCloseBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.eventModalCloseBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
    paddingVertical: 18,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginLeft: 15,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  emptyText: { color: "#BBB", fontSize: 14 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  sectionHeader: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2F459B",
    marginBottom: 15,
  },
  notificationCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#2F459B",
    marginBottom: 12,
  },
  iconContainer: { marginRight: 12 },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EEF1FF",
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: { flex: 1 },
  notiTitle: { fontSize: 15, fontWeight: "bold", color: "#2F459B" },
  notiDescription: { fontSize: 13, color: "#777", marginTop: 2 },
  dateTimeContainer: { alignItems: "flex-end" },
  notiDate: { fontSize: 10, color: "#777" },
  notiTime: { fontSize: 10, color: "#777", fontWeight: "bold" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  eventModal: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    width: "100%",
  },
  eventModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  eventModalIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EEF1FF",
    justifyContent: "center",
    alignItems: "center",
  },
  eventModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1A1A2E",
    marginBottom: 10,
  },
  eventModalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
  },
  eventModalMeta: { fontSize: 13, color: "#666" },
  eventModalDescBox: {
    backgroundColor: "#F8F9FA",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  eventModalDescLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#2F459B",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  eventModalDesc: { fontSize: 14, color: "#444", lineHeight: 20 },
  eventModalLinkBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF1FF",
    borderRadius: 8,
    padding: 10,
    gap: 8,
    marginBottom: 20,
  },
  eventModalLinkText: { flex: 1, fontSize: 12, color: "#2F459B" },
  eventModalCloseBtn: {
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor: "#2F459B",
    alignItems: "center",
  },
  eventModalCloseBtnText: { color: "white", fontWeight: "bold", fontSize: 14 },
});
