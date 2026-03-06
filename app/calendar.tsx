import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Dimensions,
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

const { width } = Dimensions.get('window');

export default function CalendarScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Events');
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const events = [
    { id: '1', title: 'LET Express - Online Session', date: 'Oct. 23, 2026', time: '10:00AM', link: 'zoommtg://zoom.us/join?confno=...' },
    { id: '2', title: 'LET Advance - Online Session', date: 'Oct. 30, 2026', time: '10:00AM', link: 'zoommtg://zoom.us/join?confno=...' },
    { id: '3', title: 'Final Coaching - Online Session', date: 'Nov. 01, 2026', time: '10:00AM', link: 'zoommtg://zoom.us/join?confno=...' },
  ];

  const todos = [
    { id: '1', title: 'To review LET on Boarding', date: 'Oct. 23, 2026 10:00AM', completed: true },
    { id: '2', title: 'To review LET on Boarding', date: 'Oct. 23, 2026 10:00AM', completed: false },
    { id: '3', title: 'To review LET on Boarding', date: 'Oct. 23, 2026 10:00AM', completed: false },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Modal animationType="fade" transparent={true} visible={isMenuVisible} onRequestClose={() => setIsMenuVisible(false)}>
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

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.monthHeader}>
          <TouchableOpacity><Ionicons name="chevron-back" size={20} color="#0D2A94" /></TouchableOpacity>
          <Text style={styles.monthTitle}>May 2025</Text>
          <TouchableOpacity><Ionicons name="chevron-forward" size={20} color="#0D2A94" /></TouchableOpacity>
        </View>

        <View style={styles.calendarGrid}>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <Text key={day} style={styles.dayLabel}>{day}</Text>
          ))}
          {[...Array(31)].map((_, i) => (
            <TouchableOpacity key={i} style={[styles.dateBox, i + 1 === 9 && styles.selectedDate]}>
              <Text style={[styles.dateText, i + 1 === 9 && styles.selectedDateText]}>{i + 1}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'Events' && styles.activeTab]} 
            onPress={() => setActiveTab('Events')}
          >
            <Text style={[styles.tabText, activeTab === 'Events' && styles.activeTabText]}>Upcoming Events</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'To Do' && styles.activeTab]} 
            onPress={() => setActiveTab('To Do')}
          >
            <Text style={[styles.tabText, activeTab === 'To Do' && styles.activeTabText]}>To Do List</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.eventSection}>
          <Text style={styles.sectionTitle}>{activeTab === 'Events' ? 'Upcoming Events' : 'To Do List'}</Text>
          
          {activeTab === 'Events' ? (
            events.map(event => (
              <View key={event.id} style={styles.eventCard}>
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventLink} numberOfLines={1}>{event.link}</Text>
                </View>
                <View style={styles.eventTimeContainer}>
                  <Text style={styles.eventDate}>{event.date}</Text>
                  <Text style={styles.eventTime}>{event.time}</Text>
                </View>
              </View>
            ))
          ) : (
            todos.map(todo => (
              <View key={todo.id} style={styles.todoCard}>
                <View style={styles.todoTextContainer}>
                  <Text style={styles.todoTitle}>{todo.title}</Text>
                  <Text style={styles.todoDate}>{todo.date}</Text>
                </View>
                <Ionicons 
                  name={todo.completed ? "checkbox" : "square-outline"} 
                  size={24} 
                  color="#0D2A94" 
                />
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => router.push('/add-todo')}>
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/homepage')}><Ionicons name="home-outline" size={24} color="#2F459B" /><Text style={styles.navText}>Home</Text></TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/courses')}><FontAwesome5 name="graduation-cap" size={20} color="#2F459B" /><Text style={styles.navText}>Courses</Text></TouchableOpacity>
        <TouchableOpacity style={styles.navItem}><Ionicons name="calendar" size={24} color="#FFB800" /><Text style={[styles.navText, { color: '#FFB800' }]}>Calendar</Text></TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/profile')}><Ionicons name="person-outline" size={24} color="#2F459B" /><Text style={styles.navText}>Profile</Text></TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  modalOverlay: { flex: 1, flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.5)' },
  clickableOverlay: { flex: 1 },
  header: { backgroundColor: '#0D2A94', height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  scrollContent: { paddingBottom: 100 },
  monthHeader: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 20 },
  monthTitle: { fontSize: 18, fontWeight: 'bold', color: '#0D2A94', marginHorizontal: 40 },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 10, marginBottom: 20 },
  dayLabel: { width: (width - 20) / 7, textAlign: 'center', color: '#BDC3C7', fontSize: 12, marginBottom: 10 },
  dateBox: { width: (width - 20) / 7, height: 40, justifyContent: 'center', alignItems: 'center' },
  dateText: { color: '#2F459B', fontSize: 14 },
  selectedDate: { backgroundColor: '#FFB800', borderRadius: 20 },
  selectedDateText: { color: 'white', fontWeight: 'bold' },
  
  tabContainer: { flexDirection: 'row', backgroundColor: '#0D2A94', marginHorizontal: 15, borderRadius: 10, overflow: 'hidden' },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  activeTab: { borderBottomWidth: 4, borderBottomColor: 'white' },
  tabText: { color: 'rgba(255,255,255,0.6)', fontWeight: 'bold' },
  activeTabText: { color: 'white' },

  eventSection: { padding: 20 },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', color: '#0D2A94', marginBottom: 15 },
  
  eventCard: { flexDirection: 'row', backgroundColor: 'white', borderRadius: 10, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: '#DCDFE3' },
  eventInfo: { flex: 1 },
  eventTitle: { fontSize: 16, fontWeight: 'bold', color: '#555' },
  eventLink: { fontSize: 10, color: '#2F459B', textDecorationLine: 'underline', marginTop: 5 },
  eventTimeContainer: { alignItems: 'flex-end', justifyContent: 'center' },
  eventDate: { fontSize: 12, color: '#7F8C8D' },
  eventTime: { fontSize: 12, fontWeight: 'bold', color: '#7F8C8D' },

  todoCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 10, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: '#DCDFE3' },
  todoTextContainer: { flex: 1 },
  todoTitle: { fontSize: 16, fontWeight: 'bold', color: '#555' },
  todoDate: { fontSize: 12, color: '#7F8C8D', marginTop: 4 },

  fab: { position: 'absolute', right: 20, bottom: 100, backgroundColor: '#FFB800', width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  bottomNav: { position: 'absolute', bottom: 0, width: '100%', height: 70, backgroundColor: 'white', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#EEE' },
  navItem: { alignItems: 'center' },
  navText: { fontSize: 12, marginTop: 4, color: '#2F459B' },
});