import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import BleReciever from '@/src/services/bleManager';


export default function HomeScreen() {
    type DeviceInfo = {
        id: string,
        name: string | null,
        connected: boolean,
        value: string,
    };

    const [devices, setDevices] = useState<DeviceInfo[]>([]);
    const [connected, setConnected] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [currentPh, setCurrentPh] = useState<string | null>(null);
    const [deviceName, setDeviceName] = useState<string | null>(null);

    const handleUpdate = (updatedDevices: DeviceInfo[]) => {
        setDevices(updatedDevices);
    }
    const bleRecieverRef = React.useRef<any>(null);
    const handleConnect = (deviceId: string) => {
        bleRecieverRef.current?.handleConnect(deviceId);
        setConnected(true);
    }


    return (
        <View style={styles.container}>
            <Text style={styles.phText}>Current pH: {currentPh}</Text>

            <Text style={[styles.statusText, { color: connected ? '#16A34A' : '#DC2626' }]}>
                {connected ? `● Connected to: ${deviceName}` : '● Disconnected'}
            </Text>

            <TouchableOpacity
                style={styles.button}
                activeOpacity={0.8}
                onPress={() => {
                    connected ? setConnected(false) : setModalVisible(true);
                }}
            >
                <Text style={styles.buttonText}>{connected ? 'Disconnect' : 'Connect'}</Text>
            </TouchableOpacity>
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {devices.map(device => (
                            <TouchableOpacity
                                key={device.id}
                                style={{ padding: 10, borderBottomWidth: 1, borderColor: '#ccc', width: '100%' }}
                                onPress={() => {handleConnect(device.id);
                                                        setCurrentPh(device.value);
                                                        setDeviceName(device.name);
                                                        setModalVisible(false);}}
                            >
                                <Text style={{ color: '#E0F2FE' }}>
                                    {device.name || 'Unnamed Device'} {device.connected ? '(Connected)' : ''}
                                </Text>
                            </TouchableOpacity>
                        ))}

                        <TouchableOpacity
                            onPress={() => setModalVisible(false)}
                            style={styles.modalButton}
                        >
                            <Text style={styles.modalButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            <BleReciever ref={bleRecieverRef} onDeviceUpdate={setDevices} />
        </View>


    );
}


const styles = StyleSheet.create({
     modalOverlay: {
            flex: 1,
            backgroundColor: '#11111180',
            justifyContent: 'center',
            alignItems: 'center',
        },
        modalContent: {
            width: '80%',
            backgroundColor: '#1F2937',
            borderRadius: 12,
            padding: 24,
            alignItems: 'center',
        },
        modalText: {
            fontSize: 18,
            color: '#E0F2FE',
            marginBottom: 20,
            textAlign: 'center',
        },
        modalButton: {
            paddingVertical: 12,
            paddingHorizontal: 24,
            backgroundColor: '#3B82F6',
            borderRadius: 10,
        },
        modalButtonText: {
            color: '#E0F2FE',
            fontWeight: '600',
            fontSize: 16,
        },
    container: {
        flex: 1,
        backgroundColor: '#111111',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    phText: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFA500',
        marginBottom: 16,
        textAlign: 'center',
    },
    statusText: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 24,
        textAlign: 'center',
    },
    button: {
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#3B82F6',
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.4,
        backgroundColor: '#111111',
        shadowRadius: 6,
        elevation: 6,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#E0F2FE',
        textAlign: 'center',
    },
});
