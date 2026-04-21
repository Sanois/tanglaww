import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function WelcomeScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  const slides = [
    {
      text: "\n\n\nWelcome to your\nnext big step!",
      image: require("../assets/images/business.png"),
    },
    {
      text: "\n\n\nExperience affordable,\nhigh-quality review programs!",
      image: require("../assets/images/business-idea.png"),
    },
    {
      text: "\n\n\nGain access to full online\nreview sessions that you\ncan replay anytime",
      image: require("../assets/images/task.png"),
    },
    {
      text: "\n\n\nJoin now and start\nyour journey!",
      image: require("../assets/images/monitoring.png"),
    },
  ];

  const handleNext = () => {
    if (currentStep < slides.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      router.push("/login");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <Image
          source={slides[currentStep].image}
          style={styles.illustration}
          resizeMode="contain"
        />
      </View>

      <View style={styles.bottomSection}>
        <SafeAreaView style={styles.innerContainer}>
          <Text style={styles.titleText}>{slides[currentStep].text}</Text>
          <View style={styles.footer}>
            <TouchableOpacity onPress={() => router.push("/login")}>
              <Text style={styles.skipBtn}>SKIP</Text>
            </TouchableOpacity>
            <View style={styles.dotRow}>
              {slides.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    currentStep === index ? styles.activeDot : null,
                  ]}
                />
              ))}
            </View>
            <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
          </View>
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
    paddingHorizontal: 30,
    paddingTop: 40,
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleText: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    color: "#000",
    lineHeight: 34,
  },
  footer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 20,
  },
  skipBtn: { color: "#2F459B", fontWeight: "600", fontSize: 16 },
  dotRow: { flexDirection: "row", gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#E0E0E0" },
  activeDot: { backgroundColor: "#FFD75E", width: 20 },
  nextBtn: {
    backgroundColor: "#2F459B",
    width: 55,
    height: 55,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  arrow: { color: "white", fontSize: 24, fontWeight: "bold" },
});
