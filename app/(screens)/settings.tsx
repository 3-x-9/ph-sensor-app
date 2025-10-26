import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import BleReceiver from "@/src/services/bleManager";

export default function CalibrationScreen() {
    const [ph4, set4ph] = useState('');
    const [ph7, set7ph] = useState('');
    const [ph10, set10ph] = useState('');
    const bleRecieverRef = React.useRef<any>(null);

    const getCalibrationInput = (placeholder: string, value: string, setter: (val: string) => void) => {
        return (
            <TextInput
                style={styles.input}
                placeholder={placeholder}
                value={value}
                onChangeText={setter}
                keyboardType="numeric"
                placeholderTextColor="#9CA3AF"
            />
        );
    };

    const applyCalibration = () => {
        const v4 = parseFloat(ph4);
        const v7 = parseFloat(ph7);
        const v10 = parseFloat(ph10);

        if (isNaN(v4) || isNaN(v7)) {
            console.warn('Wrong input');
            return;
        }

        const slope1 = (7 - 4) / (v7 - v4);
        const slope2 = (10 - 7) / (v10 - v7);
        const m = (slope1 + slope2) / 2;
        const b = 4 - m * v4;

        const calibrationData = JSON.stringify({m, b});
        const base64Value = Buffer.from(calibrationData).toString('base64');
        console.log('CalibrationScreen data', calibrationData);

        const activeDevice = bleRecieverRef.current?.activeDevice;
        bleRecieverRef.current.sendCalibration(activeDevice.id ,calibrationData);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Calibration</Text>

            <Text style={styles.instruction}>1. Immerse the sensor in pH 4.0 buffer solution.</Text>
            {getCalibrationInput('Enter voltage for pH 4.0', ph4, set4ph)}

            <Text style={styles.instruction}>2. Repeat with pH 7.0 buffer solution.</Text>
            {getCalibrationInput('Enter voltage for pH 7.0', ph7, set7ph)}

            <Text style={styles.instruction}>3. Optionally test with pH 10.0 buffer.</Text>
            {getCalibrationInput('Enter voltage for pH 10.0', ph10, set10ph)}

            <TouchableOpacity style={styles.button} onPress={applyCalibration} activeOpacity={0.8}>
                <Text style={styles.buttonText}>Apply Calibration</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#111111',
        padding: 20,
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#E0F2FE',
        marginVertical: 30,
        textAlign: 'center',
    },
    instruction: {
        fontSize: 16,
        color: '#D1D5DB',
        marginBottom: 8,
        textAlign: 'center',
    },
    input: {
        width: '80%',
        borderWidth: 1,
        borderColor: '#374151',
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginBottom: 16,
        color: '#F3F4F6',
        backgroundColor: '#1F2937',
    },
    button: {
        marginTop: 20,
        width: '60%',
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: '#1E40AF',
        borderWidth: 1,
        borderColor: '#3B82F6',
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
        elevation: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: '#E0F2FE',
        fontSize: 16,
        fontWeight: '600',
    },
});
