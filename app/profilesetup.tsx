import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function ProfileSetupScreen() {
    const router = useRouter();
    const [form, setForm] = useState({
        fullName: '',
        contact: '',
        major: '',
    });

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {/* Progress Indicator (Optional but helpful) */}
                    <View style={styles.stepContainer}>
                        <Text style={styles.stepText}>Step 2 of 2: Profile Setup</Text>
                    </View>

                    <Text style={styles.title}>Complete Your Profile</Text>
                    <Text style={styles.subtitle}>Help us personalize your learning experience.</Text>

                    {/* Avatar Placeholder */}
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatarCircle}>
                            <Ionicons name="person" size={50} color="#BDC3C7" />
                            <TouchableOpacity style={styles.cameraBtn}>
                                <Ionicons name="camera" size={18} color="white" />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.avatarLabel}>Upload Profile Picture</Text>
                    </View>

                    {/* Form Fields */}
                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Full Name</Text>
                            <TextInput 
                                style={styles.input}
                                placeholder="Juan Dela Cruz"
                                placeholderTextColor="#999"
                                value={form.fullName}
                                onChangeText={(val) => setForm({...form, fullName: val})}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Contact Number</Text>
                            <TextInput 
                                style={styles.input}
                                placeholder="0912 345 6789"
                                placeholderTextColor="#999"
                                keyboardType="phone-pad"
                                value={form.contact}
                                onChangeText={(val) => setForm({...form, contact: val})}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Major / Specialization</Text>
                            <TextInput 
                                style={styles.input}
                                placeholder="e.g. BEED, BSEED - English"
                                placeholderTextColor="#999"
                                value={form.major}
                                onChangeText={(val) => setForm({...form, major: val})}
                            />
                        </View>
                    </View>

                    <TouchableOpacity 
                        style={styles.saveBtn} 
                        // This now leads to the "Congratulations" screen
                        onPress={() => router.push('/succes')} 
                    >
                        <Text style={styles.saveText}>Finish Setup</Text>
                        <Ionicons name="arrow-forward" size={18} color="white" style={{marginLeft: 8}} />
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'white' },
    scrollContent: { padding: 30, paddingBottom: 50 },
    stepContainer: { marginBottom: 10 },
    stepText: { fontSize: 12, fontWeight: 'bold', color: '#FFB800', textTransform: 'uppercase' },
    title: { fontSize: 28, fontWeight: 'bold', color: '#0D2A94', marginBottom: 8 },
    subtitle: { fontSize: 14, color: '#666', marginBottom: 30 },
    
    // Avatar Styles
    avatarContainer: { alignItems: 'center', marginBottom: 30 },
    avatarCircle: { 
        width: 100, 
        height: 100, 
        borderRadius: 50, 
        backgroundColor: '#F2F4F7', 
        justifyContent: 'center', 
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#DCDFE3',
        position: 'relative'
    },
    cameraBtn: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#0D2A94',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'white'
    },
    avatarLabel: { fontSize: 12, color: '#0D2A94', marginTop: 10, fontWeight: '500' },

    form: { width: '100%' },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: 'bold', color: '#0D2A94', marginBottom: 8 },
    input: { 
        borderWidth: 1, 
        borderColor: '#DCDFE3', 
        borderRadius: 8, 
        padding: 15, 
        fontSize: 16, 
        backgroundColor: '#F9FAFB',
        color: '#333'
    },
    saveBtn: { 
        backgroundColor: '#0D2A94', 
        width: '100%', 
        padding: 16, 
        borderRadius: 8, 
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4
    },
    saveText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});