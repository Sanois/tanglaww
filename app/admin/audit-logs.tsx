import { supabase } from "@/lib/supabase";
import { getActionColor, getActionLabel } from "@/services/auditService";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface AuditLog {
  id: string;
  userType: "admin" | "student";
  userId: string;
  userName: string | null;
  action: string;
  targetType: string | null;
  targetId: string | null;
  targetName: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
}

const FILTERS = ["All", "Admin", "Student"] as const;
type Filter = (typeof FILTERS)[number];

export default function AuditLogScreen() {
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<Filter>("All");

  const fetchLogs = async () => {
    const { data, error } = await supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    if (!error && data) setLogs(data as AuditLog[]);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesFilter =
      activeFilter === "All" || log.userType === activeFilter.toLowerCase();

    const searchLower = search.toLowerCase();
    const matchesSearch =
      !search ||
      (log.userName ?? "").toLowerCase().includes(searchLower) ||
      getActionLabel(log.action).toLowerCase().includes(searchLower) ||
      (log.targetName ?? "").toLowerCase().includes(searchLower) ||
      log.action.toLowerCase().includes(searchLower);

    return matchesFilter && matchesSearch;
  });

  const formatTime = (iso: string) => {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "yesterday";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const renderItem = ({ item, index }: { item: AuditLog; index: number }) => {
    const actionColor = getActionColor(item.action);
    const actionLabel = getActionLabel(item.action);
    const isAdmin = item.userType === "admin";

    return (
      <View style={styles.logRow}>
        {/* Timeline line */}
        <View style={styles.timelineCol}>
          <View style={[styles.dot, { backgroundColor: actionColor }]} />
          {index < filteredLogs.length - 1 && (
            <View style={styles.timelineLine} />
          )}
        </View>

        <View style={styles.logCard}>
          <View style={styles.logCardTop}>
            <View
              style={[
                styles.actorBadge,
                { backgroundColor: isAdmin ? "#EEF1FF" : "#FFF8E8" },
              ]}
            >
              <Ionicons
                name={isAdmin ? "shield-outline" : "person-outline"}
                size={11}
                color={isAdmin ? "#2F459B" : "#B8860B"}
              />
              <Text
                style={[
                  styles.actorBadgeText,
                  { color: isAdmin ? "#2F459B" : "#B8860B" },
                ]}
              >
                {isAdmin ? "Admin" : "Student"}
              </Text>
            </View>
            <Text style={styles.timeText}>{formatTime(item.created_at)}</Text>
          </View>

          <Text style={styles.actorName}>{item.userName ?? item.userId}</Text>

          <View style={styles.actionRow}>
            <View
              style={[
                styles.actionPill,
                { backgroundColor: actionColor + "18" },
              ]}
            >
              <View
                style={[styles.actionDot, { backgroundColor: actionColor }]}
              />
              <Text style={[styles.actionText, { color: actionColor }]}>
                {actionLabel}
              </Text>
            </View>
          </View>

          {item.targetName && (
            <View style={styles.targetRow}>
              <Ionicons name="arrow-forward" size={11} color="#AAA" />
              <Text style={styles.targetText} numberOfLines={1}>
                {item.targetName}
              </Text>
              {item.targetType && (
                <Text style={styles.targetType}>({item.targetType})</Text>
              )}
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <View style={{ marginLeft: 20 }}>
          <Text style={styles.title}>Audit Log</Text>
          <Text style={styles.subtitle}>{filteredLogs.length} events</Text>
        </View>
        <TouchableOpacity
          style={styles.refreshBtn}
          onPress={onRefresh}
          disabled={refreshing}
        >
          <Ionicons name="refresh-outline" size={20} color="#2F459B" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color="#999" />
        <TextInput
          placeholder="Search by name, action, or target..."
          style={styles.input}
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#BBB"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={18} color="#BBB" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterTab,
              activeFilter === f && styles.filterTabActive,
            ]}
            onPress={() => setActiveFilter(f)}
          >
            <Text
              style={[
                styles.filterTabText,
                activeFilter === f && styles.filterTabTextActive,
              ]}
            >
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2F459B" />
        </View>
      ) : filteredLogs.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="file-tray-outline" size={48} color="#DDD" />
          <Text style={styles.emptyText}>No logs found</Text>
        </View>
      ) : (
        <FlatList
          data={filteredLogs}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#2F459B"]}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  header: {
    backgroundColor: "#FFD75E",
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
  },
  title: { fontSize: 18, fontWeight: "bold", color: "black" },
  subtitle: { fontSize: 11, color: "#555", marginTop: 1 },
  refreshBtn: { marginLeft: "auto" },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    margin: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  input: { flex: 1, fontSize: 13, color: "#333" },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
  },
  filterTabActive: { backgroundColor: "#2F459B" },
  filterTabText: { fontSize: 12, color: "#777", fontWeight: "500" },
  filterTabTextActive: { color: "white" },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  emptyText: { color: "#BBB", fontSize: 14 },
  listContent: { paddingHorizontal: 16, paddingBottom: 40, paddingTop: 8 },

  logRow: { flexDirection: "row", marginBottom: 4 },
  timelineCol: { width: 24, alignItems: "center", paddingTop: 14 },
  dot: { width: 10, height: 10, borderRadius: 5, zIndex: 1 },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: "#EEE",
    marginTop: 2,
  },
  logCard: {
    flex: 1,
    marginLeft: 10,
    backgroundColor: "#FAFAFA",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  logCardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  actorBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  actorBadgeText: { fontSize: 10, fontWeight: "700" },
  timeText: { fontSize: 11, color: "#BBB" },
  actorName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1A1A2E",
    marginBottom: 6,
  },
  actionRow: { marginBottom: 4 },
  actionPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 5,
  },
  actionDot: { width: 6, height: 6, borderRadius: 3 },
  actionText: { fontSize: 11, fontWeight: "600" },
  targetRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  targetText: { fontSize: 11, color: "#888", flex: 1 },
  targetType: { fontSize: 10, color: "#BBB" },
});
