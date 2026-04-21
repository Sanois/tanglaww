import { useRouter } from "expo-router";
import React from "react";
import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function LoginScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <Image
          source={require("../assets/images/business-idea (1).png")}
          style={styles.illustration}
          resizeMode="contain"
        />
      </View>

      <View style={styles.bottomSection}>
        <View style={{ height: 50 }} />
        <SafeAreaView style={styles.innerContainer}>
          <Text style={styles.quoteText}>
            “Where a Dreamer becomes an Achiever!”
          </Text>
          <View style={{ height: 5 }} />

          <View style={styles.buttonContainer}>
            <View style={styles.buttonWrapper}>
              <TouchableOpacity
                style={styles.signInBtn}
                onPress={() => router.push("/signin")}
              >
                <Text style={styles.signInText}>Sign-in</Text>
              </TouchableOpacity>
              <Text style={styles.subLabel}>For Existing users</Text>
            </View>

            <View style={styles.buttonWrapper}>
              <TouchableOpacity
                style={styles.enrollBtn}
                onPress={() => router.push("/enroll")}
              >
                <Text style={styles.enrollText}>Enroll Now</Text>
              </TouchableOpacity>
              <Text style={styles.subLabel}>For New users</Text>
            </View>
          </View>

          <TouchableOpacity onPress={() => router.push("/code")}>
            <Text style={styles.enrollCodeLink}>Use Enrollment Code</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  topSection: {
    flex: 1.3,
    backgroundColor: "#FFD75E",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
  },
  illustration: {
    width: "70%",
    height: "70%",
  },
  bottomSection: {
    flex: 1,
    backgroundColor: "white",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    marginTop: -40,
    paddingHorizontal: 30,
    paddingBottom: 40,
  },
  innerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 30,
    paddingTop: 20,
  },
  quoteText: {
    fontSize: 22,
    fontWeight: "bold",
    fontStyle: "italic",
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
  buttonWrapper: { alignItems: "center", width: "48%" },
  signInBtn: {
    width: "100%",
    padding: 15,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#2F459B",
    alignItems: "center",
  },
  signInText: { color: "#2F459B", fontWeight: "bold", fontSize: 16 },
  enrollBtn: {
    width: "100%",
    padding: 15,
    borderRadius: 8,
    backgroundColor: "#2F459B",
    alignItems: "center",
  },
  enrollText: { color: "white", fontWeight: "bold", fontSize: 16 },
  subLabel: { fontSize: 12, color: "black", marginTop: 5, fontWeight: "500" },
  enrollCodeLink: {
    color: "#2F459B",
    textDecorationLine: "underline",
    fontWeight: "bold",
    fontSize: 16,
  },
});
