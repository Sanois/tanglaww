import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function AdminTodo() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');

  const handleSave = () => {
    console.log("Saved:", title, date);
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Task</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Task Title</Text>
        <TextInput 
          style={styles.input} 
          placeholder="e.g. LET Review Session" 
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Date & Time</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Oct. 23, 2026 10:00AM" 
          value={date}
          onChangeText={setDate}
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Task</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#FFD75E' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  form: { padding: 20 },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 8, color: '#2F459B' },
  input: { borderWidth: 1, borderColor: '#EEE', borderRadius: 8, padding: 12, marginBottom: 20, fontSize: 16 },
  saveButton: { backgroundColor: '#FFD75E', padding: 15, borderRadius: 8, alignItems: 'center' },
  saveButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});