import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    Dimensions,
    ImageBackground,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');
const headerBg = require('../assets/images/llpt.jpg');

export default function EnrollmentCodeScreen() {
    const router = useRouter();
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const inputs = useRef<TextInput[]>([]);

    const isCodeComplete = code.every(digit => digit !== '');

    const handleTextChange = (text: string, index: number) => {
        const cleanText = text.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        const newCode = [...code];
        newCode[index] = cleanText;
        setCode(newCode);

        if (cleanText && index < 5) {
            inputs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
                style={{ flex: 1 }}
            >
                <ImageBackground source={headerBg} style={styles.header}>
                    <View style={styles.headerOverlay}>
                        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                            <Ionicons name="arrow-back" size={24} color="#0D2A94" />
                        </TouchableOpacity>
                    </View>
                </ImageBackground>

                <View style={styles.content}>
                    <Text style={styles.title}>Activate your Account</Text>
                    <Text style={styles.subtitle}>You're a few steps away from your growth journey!</Text>

                    <View style={styles.inputSection}>
                        <Text style={styles.inputLabel}>Enter Enrollment Code</Text>
                        
                        <View style={styles.codeContainer}>
                            {code.map((digit, index) => (
                                <View 
                                    key={index} 
                                    style={[
                                        styles.codeBox, 
                                        { borderColor: digit ? '#0D2A94' : '#BDC3C7' }
                                    ]}
                                >
                                    <TextInput
                                        ref={(el) => { if (el) inputs.current[index] = el; }}
                                        style={styles.codeInput}
                                        maxLength={1}
                                        keyboardType="default"
                                        autoCapitalize="characters"
                                        onChangeText={(text) => handleTextChange(text, index)}
                                        onKeyPress={(e) => handleKeyPress(e, index)}
                                        value={digit}
                                        placeholder="•"
                                        placeholderTextColor="#BDC3C7"
                                        selectionColor="#0D2A94"
                                    />
                                </View>
                            ))}
                        </View>

                        <View style={styles.hintContainer}>
                            <Ionicons name="bulb-outline" size={16} color="#FFB800" />
                            <Text style={styles.hintText}>
                                Didn't receive the code? Kindly check your spam folder
                            </Text>
                        </View>
                    </View>

                    <TouchableOpacity 
                        style={[
                            styles.continueBtn, 
                            { opacity: isCodeComplete ? 1 : 0.6 }
                        ]} 
                        onPress={() => isCodeComplete && router.push('/profilesetup')}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.continueText}>Continue</Text>
                        <Ionicons name="chevron-forward" size={18} color="white" style={{marginLeft: 5}} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'white' },
    header: { width: '100%', height: 200 },
    headerOverlay: { flex: 1, backgroundColor: 'rgba(13, 42, 148, 0.1)' },
    backBtn: { 
        marginTop: 20, 
        marginLeft: 20, 
        backgroundColor: 'white', 
        width: 40, 
        height: 40, 
        borderRadius: 20, 
        justifyContent: 'center', 
        alignItems: 'center', 
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3
    },
    content: { flex: 1, paddingHorizontal: 30, alignItems: 'center', marginTop: 30 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#0D2A94', marginBottom: 10 },
    subtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 40 },
    inputSection: { width: '100%' },
    inputLabel: { fontSize: 18, fontWeight: 'bold', color: '#0D2A94', marginBottom: 20 },
    codeContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    codeBox: {
        width: (width - 100) / 6,
        height: 55,
        borderWidth: 2,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9FAFB'
    },
    codeInput: { 
        fontSize: 22, 
        fontWeight: 'bold', 
        color: '#0D2A94', 
        textAlign: 'center', 
        width: '100%' 
    },
    hintContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
    hintText: { fontSize: 11, color: '#666', marginLeft: 5, fontStyle: 'italic' },
    continueBtn: { 
        backgroundColor: '#0D2A94', 
        width: '100%', 
        padding: 16, 
        borderRadius: 12, 
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        bottom: 40,
        elevation: 3
    },
    continueText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});