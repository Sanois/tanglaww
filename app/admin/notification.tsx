import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Notification {
  id: string;
  type: "enrollment" | "event";
  label: string;
  title: string;
  description: string;
  date: string; // formatted date string for display
  time: string; // formatted time string for display
  route?: string;
  createdAt: string; // ISO — used for Today/Yesterday/Earlier grouping
}

// ── Helpers ────────────────────────────────────────────────────────────────

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const formatTime = (iso: string): string =>
  new Date(iso).toLocaleTimeString("en-PH", {
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
  const y = new Date();
  y.setDate(y.getDate() - 1);
  return (
    d.getDate() === y.getDate() &&
    d.getMonth() === y.getMonth() &&
    d.getFullYear() === y.getFullYear()
  );
};

// ── Screen ─────────────────────────────────────────────────────────────────

export default function AdminNotification() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = useCallback(async () => {
    const results: Notification[] = [];

    // Pending enrollments
    const { data: enrollments } = await supabase
      .from("enrollment")
      .select(
        `
        enrollment_id,
        enrollmentDate,
        student (firstName, lastName),
        verification!enrollment_verification_id_fkey (verificationStatus, verificationNotes)
      `,
      )
      .order("enrollmentDate", { ascending: false });

    (enrollments ?? []).forEach((e: any) => {
      const v = Array.isArray(e.verification)
        ? e.verification[0]
        : e.verification;
      const isPending =
        v?.verificationStatus === false && !v?.verificationNotes;
      if (isPending) {
        results.push({
          id: `enrollment-${e.enrollment_id}`,
          type: "enrollment",
          label: "New Enrollment",
          title: `${e.student?.firstName} ${e.student?.lastName}`,
          description: "Awaiting your review and approval",
          date: formatDate(e.enrollmentDate),
          time: formatTime(e.enrollmentDate),
          route: "/admin/approval",
          createdAt: e.enrollmentDate,
        });
      }
    });

    // All calendar events
    const { data: events } = await supabase
      .from("calendar_events")
      .select("*")
      .order("event_date", { ascending: false });

    (events ?? []).forEach((event: any) => {
      results.push({
        id: `event-${event.event_id}`,
        type: "event",
        label: "Calendar Event",
        title: event.title,
        description: event.description ?? "",
        date: formatDate(event.event_date),
        time: formatTime(event.event_date),
        route: "/admin/calendar",
        createdAt: event.event_date,
      });
    });

    // Enrollments first, then events
    results.sort((a, b) => {
      if (a.type === "enrollment" && b.type !== "enrollment") return -1;
      if (b.type === "enrollment" && a.type !== "enrollment") return 1;
      return 0;
    });

    setNotifications(results);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  }, [fetchNotifications]);

  const todayItems = notifications.filter((n) => isToday(n.createdAt));
  const yesterdayItems = notifications.filter((n) => isYesterday(n.createdAt));
  const olderItems = notifications.filter(
    (n) => !isToday(n.createdAt) && !isYesterday(n.createdAt),
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2F459B" />
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="notifications-off-outline" size={64} color="#DDD" />
          <Text style={styles.emptyTitle}>All caught up!</Text>
          <Text style={styles.emptySubtitle}>
            No pending enrollments or upcoming events.
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#2F459B"]}
            />
          }
        >
          {todayItems.length > 0 && (
            <>
              <Text style={styles.sectionHeader}>Today</Text>
              {todayItems.map((n) => (
                <NotificationCard
                  key={n.id}
                  notif={n}
                  onPress={() => n.route && router.push(n.route as any)}
                />
              ))}
            </>
          )}

          {yesterdayItems.length > 0 && (
            <>
              <Text style={[styles.sectionHeader, { marginTop: 10 }]}>
                Yesterday
              </Text>
              {yesterdayItems.map((n) => (
                <NotificationCard
                  key={n.id}
                  notif={n}
                  onPress={() => n.route && router.push(n.route as any)}
                />
              ))}
            </>
          )}

          {olderItems.length > 0 && (
            <>
              <Text style={[styles.sectionHeader, { marginTop: 10 }]}>
                Earlier
              </Text>
              {olderItems.map((n) => (
                <NotificationCard
                  key={n.id}
                  notif={n}
                  onPress={() => n.route && router.push(n.route as any)}
                />
              ))}
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// ── Card ───────────────────────────────────────────────────────────────────

function NotificationCard({
  notif,
  onPress,
}: {
  notif: Notification;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.notificationCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.textContainer}>
        <Text style={styles.label}>{notif.label}</Text>
        <Text style={styles.notiTitle}>{notif.title}</Text>
        {notif.description ? (
          <Text style={styles.notiDescription} numberOfLines={1}>
            {notif.description}
          </Text>
        ) : null}
      </View>
      <View style={styles.dateTimeContainer}>
        <Text style={styles.notiDate}>{notif.date}</Text>
        <Text style={styles.notiTime}>{notif.time}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────

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
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    padding: 40,
  },
  emptyTitle: { fontSize: 18, fontWeight: "bold", color: "#555" },
  emptySubtitle: { fontSize: 13, color: "#999", textAlign: "center" },
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
  textContainer: { flex: 1 },
  label: {
    fontSize: 11,
    fontWeight: "700",
    color: "#2F459B",
    fontStyle: "italic",
    marginBottom: 3,
  },
  notiTitle: { fontSize: 15, fontWeight: "bold", color: "#2F459B" },
  notiDescription: { fontSize: 13, color: "#777", marginTop: 2 },
  dateTimeContainer: { alignItems: "flex-end" },
  notiDate: { fontSize: 10, color: "#777" },
  notiTime: { fontSize: 10, color: "#777", fontWeight: "bold" },
});
