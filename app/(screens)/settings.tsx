import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function CalibrationScreen() {
  const [ph4, set4ph] = useState('');
  const [ph7, set7ph] = useState('');
  const [ph10, set10ph] = useState('');
  const bleRecieverRef = useRef<any>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const { width } = Dimensions.get('window');

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const applyCalibration = () => {
    const v4 = parseFloat(ph4);
    const v7 = parseFloat(ph7);
    const v10 = parseFloat(ph10);

    if (isNaN(v4) || isNaN(v7)) {
      console.warn('Invalid input');
      return;
    }

    const slope1 = (7 - 4) / (v7 - v4);
    const slope2 = (10 - 7) / (v10 - v7);
    const m = (slope1 + slope2) / 2;
    const b = 4 - m * v4;

    const calibrationData = JSON.stringify({ m, b });
    console.log('CalibrationScreen data', calibrationData);

    const activeDevice = bleRecieverRef.current?.activeDevice;
    bleRecieverRef.current?.sendCalibration(activeDevice.id, calibrationData);
  };

  const renderInput = (label: string, value: string, setter: (v: string) => void) => (
    <View style={styles.inputCard}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={setter}
        keyboardType="numeric"
        placeholder="Enter voltage"
        placeholderTextColor="#9CA3AF"
      />
    </View>
  );

  return (
    <LinearGradient
      colors={['#0B0B0F', '#111827', '#1E293B']}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Animated.View
            style={[
              styles.innerContainer,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <Text style={styles.title}>Calibration</Text>

            <Text style={styles.instruction}>
              Please input the voltage readings for each buffer solution:
            </Text>

            {renderInput('pH 4.0 Buffer', ph4, set4ph)}
            {renderInput('pH 7.0 Buffer', ph7, set7ph)}
            {renderInput('pH 10.0 Buffer (optional)', ph10, set10ph)}

            <TouchableOpacity
              style={styles.button}
              activeOpacity={0.85}
              onPress={applyCalibration}
            >
              <LinearGradient
                colors={['#2563EB', '#1E40AF']}
                style={styles.gradient}
              >
                <Text style={styles.buttonText}>Apply Calibration</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  innerContainer: {
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#E0F2FE',
    marginBottom: 40,
    textAlign: 'center',
  },
  instruction: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 30,
    maxWidth: width * 0.85,
  },
  inputCard: {
    width: '85%',
    backgroundColor: 'rgba(17, 24, 39, 0.9)',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E0F2FE',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#1E293B',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    color: '#F3F4F6',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  button: {
    width: '70%',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#3B82F6',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
    marginTop: 10,
  },
  gradient: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F9FAFB',
  },
});
