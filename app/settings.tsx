import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function SettingsScreen() {
  const router = useRouter();
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionLabel}>Account Settings</Text>
        <View style={styles.sectionGroup}>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push("/newpass")}
          >
            <View style={styles.itemLeft}>
              <Ionicons name="lock-closed-outline" size={22} color="#0D2A94" />
              <Text style={styles.itemText}>Change Password</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#BDC3C7" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push("/profile")}
          >
            <View style={styles.itemLeft}>
              <MaterialCommunityIcons
                name="account-details-outline"
                size={22}
                color="#0D2A94"
              />
              <Text style={styles.itemText}>Manage Account</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#BDC3C7" />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>Notification Settings</Text>
        <View style={styles.sectionGroup}>
          <View style={styles.settingItemRow}>
            <View style={styles.itemLeft}>
              <Ionicons name="mail-outline" size={22} color="#0D2A94" />
              <View style={styles.textStack}>
                <Text style={styles.itemText}>Email Notifications</Text>
                <Text style={styles.subText}>
                  Receive reminders and important updates directly through your
                  email.
                </Text>
              </View>
            </View>
            <Switch
              value={emailEnabled}
              onValueChange={setEmailEnabled}
              trackColor={{ false: "#D1D1D1", true: "#0D2A94" }}
              thumbColor="white"
            />
          </View>

          <View style={styles.settingItemRow}>
            <View style={styles.itemLeft}>
              <Ionicons
                name="notifications-outline"
                size={22}
                color="#0D2A94"
              />
              <View style={styles.textStack}>
                <Text style={styles.itemText}>Push Notifications</Text>
                <Text style={styles.subText}>
                  Get instant alerts within the app for new schedules, quizzes,
                  and announcements.
                </Text>
              </View>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={setPushEnabled}
              trackColor={{ false: "#D1D1D1", true: "#0D2A94" }}
              thumbColor="white"
            />
          </View>
        </View>

        <Text style={styles.sectionLabel}>Preferences</Text>
        <View style={styles.sectionGroup}>
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.itemLeft}>
              <Ionicons name="sunny-outline" size={22} color="#0D2A94" />
              <Text style={styles.itemText}>App Theme</Text>
            </View>
            <Ionicons name="chevron-down" size={20} color="#BDC3C7" />
          </TouchableOpacity>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    backgroundColor: "#0D2A94",
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  headerTitle: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
  },
  scrollContent: {
    padding: 20,
    flexGrow: 1,
  },
  sectionLabel: {
    fontSize: 14,
    color: "#95A5A6",
    fontWeight: "600",
    marginBottom: 10,
    marginTop: 15,
  },
  sectionGroup: {
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
  },
  settingItemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingVertical: 15,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
    paddingRight: 10,
  },
  textStack: {
    marginLeft: 15,
    flex: 1,
    marginTop: -2,
  },
  itemText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
    lineHeight: 22,
  },
  subText: {
    fontSize: 12,
    color: "#95A5A6",
    marginTop: 2,
    lineHeight: 16,
  },
});
