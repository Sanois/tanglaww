import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import HamburgerMenu from './hamburger';

export default function CoursesScreen() {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const COURSES = [
    { id: '1', title: 'LET On Boarding (Concept-Driven)', instructor: 'Mr. Ruel Atun', progress: 100, isLocked: false },
    { id: '2', title: 'LET Express', instructor: 'Mr. Ruel Atun', progress: 70, isLocked: false },
    { id: '3', title: 'LET Advanced', instructor: 'Mr. Ruel Atun', progress: 0, isLocked: true },
    { id: '4', title: 'Integrative', instructor: 'Mr. Ruel Atun', progress: 0, isLocked: true },
  ];

  const toggleDropdown = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

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
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => setIsMenuVisible(true)}>
            <Ionicons name="menu" size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Courses</Text>
        </View>
        <TouchableOpacity>
          <MaterialCommunityIcons name="chart-bar" size={26} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {COURSES.map((course) => (
          <View key={course.id} style={styles.cardContainer}>
            <TouchableOpacity 
              style={styles.courseCard} 
              onPress={() => !course.isLocked && toggleDropdown(course.id)}
              activeOpacity={0.9}
            >
              <View style={styles.imageSection}>
                {/* Fixed Progress Circle logic */}
                <View style={styles.progressBadge}>
                  <View style={[
                    styles.progressCircle, 
                    { borderColor: course.progress === 100 ? "#2ECC71" : "#BDC3C7" }
                  ]} />
                  <Text style={styles.progressText}>{course.progress}%</Text>
                </View>
                
                <Ionicons 
                  name={course.isLocked ? "lock-closed" : "image-outline"} 
                  size={40} 
                  color={course.isLocked ? "#333" : "#BDC3C7"} 
                />
              </View>

              <View style={styles.infoSection}>
                <View style={styles.textContainer}>
                  <Text style={styles.courseTitleText}>{course.title}</Text>
                  <Text style={styles.instructorText}>{course.instructor}</Text>
                </View>
                <Ionicons 
                  name={expandedId === course.id ? "chevron-up" : "chevron-down"} 
                  size={24} 
                  color="#BDC3C7" 
                />
              </View>
            </TouchableOpacity>

            {expandedId === course.id && (
              <View style={styles.dropdownContent}>
                {/* Handouts available for all unlocked */}
                <TouchableOpacity 
                  style={styles.dropdownItem} 
                  onPress={() => router.push({
                    pathname: "/materials/handout",
                    params: { courseTitle: course.title }
                  })}
                >
                  <Ionicons name="document-text-outline" size={20} color="#2F459B" />
                  <Text style={styles.dropdownText}>Handouts</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.dropdownItem}>
                  <Ionicons name="play-circle-outline" size={20} color="#2F459B" />
                  <Text style={styles.dropdownText}>Recorded Sessions</Text>
                </TouchableOpacity>

                {/* Conditional sections: Only for non-Onboarding courses */}
                {course.id !== '1' && (
                  <>
                    <TouchableOpacity style={styles.dropdownItem}>
                      <Ionicons name="bulb-outline" size={20} color="#2F459B" />
                      <Text style={styles.dropdownText}>Quiz</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.dropdownItem}>
                      <Ionicons name="share-outline" size={20} color="#2F459B" />
                      <Text style={styles.dropdownText}>Online Session Link</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/homepage')}>
          <Ionicons name="home-outline" size={24} color="#2F459B" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/courses')}>
          <FontAwesome5 name="graduation-cap" size={20} color="#FFB800" />
          <Text style={[styles.navText, { color: '#FFB800' }]}>Courses</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/calendar')}>
          <Ionicons name="calendar-outline" size={24} color="#2F459B" />
          <Text style={styles.navText}>Calendar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/profile')}>
          <Ionicons name="person-outline" size={24} color="#2F459B" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  modalOverlay: { flex: 1, flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.5)' },
  clickableOverlay: { flex: 1 },
  header: { 
    backgroundColor: '#0D2A94', 
    height: 60, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20 
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { color: 'white', fontSize: 22, fontWeight: 'bold', marginLeft: 15 },
  scrollContent: { padding: 15, paddingBottom: 100 },
  cardContainer: { marginBottom: 15 },
  courseCard: { backgroundColor: 'white', borderRadius: 12, overflow: 'hidden', elevation: 3 },
  imageSection: { height: 120, backgroundColor: '#F2F4F7', justifyContent: 'center', alignItems: 'center' },
  progressBadge: { 
    position: 'absolute', 
    top: 10, 
    left: 10, 
    backgroundColor: 'white', 
    borderRadius: 12, 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    flexDirection: 'row', 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEE'
  },
  progressCircle: { width: 12, height: 12, borderRadius: 6, borderWidth: 2, marginRight: 5 },
  progressText: { fontSize: 10, fontWeight: 'bold', color: '#555' },
  infoSection: { flexDirection: 'row', alignItems: 'center', padding: 15 },
  textContainer: { flex: 1 },
  courseTitleText: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  instructorText: { fontSize: 12, color: '#7F8C8D' },
  dropdownContent: { backgroundColor: '#F0F2F8', borderBottomLeftRadius: 12, borderBottomRightRadius: 12, padding: 10 },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 15 },
  dropdownText: { marginLeft: 10, color: '#2F459B', fontWeight: '500', textDecorationLine: 'underline' },
  bottomNav: { 
    position: 'absolute', 
    bottom: 0, 
    width: '100%', 
    height: 70, 
    backgroundColor: 'white', 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    alignItems: 'center', 
    borderTopWidth: 1, 
    borderTopColor: '#EEE' 
  },
  navItem: { alignItems: 'center' },
  navText: { fontSize: 12, marginTop: 4, color: '#2F459B' }
});