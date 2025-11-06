import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import BleReceiver from '@/src/services/bleManager';

export default function HomeScreen() {
  type DeviceInfo = {
    id: string;
    name: string | null;
    connected: boolean;
    value: string;
  };

  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [connected, setConnected] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentPh, setCurrentPh] = useState<number | null>(null);
  const [deviceName, setDeviceName] = useState<string | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const bleReceiverRef = useRef<any>(null);

  const handleConnect = (deviceId: string) => {
    bleReceiverRef.current?.handleConnect(deviceId);
    setConnected(true);
  };

  const setDict = (deviceId: string) => {
    const updatedDevices = devices.map(user => 
      user.id === deviceId
      ? {...user, connected: true}
      : user
    );
    setDevices(updatedDevices)
  }

  useEffect(() => {
    const active = devices.find((d) => d.connected);
    if (active) setCurrentPh(parseFloat(active.value));
  }, [devices]);

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

  return (
    <LinearGradient
      colors={['#0B0B0F', '#111827', '#1E293B']}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.innerContainer,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <Text style={styles.title}>pH Monitor</Text>

        <View style={styles.card}>
          <Text style={styles.phText}>
            {currentPh !== null ? currentPh.toFixed(2) : "--" }
          </Text>
          <Text style={styles.subLabel}>Current pH Level</Text>
        </View>

        <Text
          style={[
            styles.statusText,
            { color: connected ? '#22C55E' : '#EF4444' },
          ]}
        >
          {connected
            ? `● Connected to: ${deviceName || 'Unknown Device'}`
            : '● Disconnected'}
        </Text>

        <TouchableOpacity
          style={[
            styles.button,
            connected ? styles.disconnectBtn : styles.connectBtn,
          ]}
          activeOpacity={0.85}
          onPress={() => {
            if (connected && deviceName) {
              const device = devices.find((d) => d.name === deviceName);
              if (device) bleReceiverRef.current?.handleDisconnect(device.id);
              setConnected(false);
            } else {
              setModalVisible(true);
            }
          }}
        >
          <LinearGradient
            colors={
              connected
                ? ['#DC2626', '#7F1D1D']
                : ['#2563EB', '#1E40AF']
            }
            style={styles.gradient}
          >
            <Text style={styles.buttonText}>
              {connected ? 'Disconnect' : 'Connect'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* BLE Connection Modal */}
      <Modal
        animationType="fade"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Available Devices</Text>

            {devices.length === 0 ? (
              <Text style={styles.modalText}>No devices found</Text>
            ) : (
              devices.map((device) => (
                <TouchableOpacity
                  key={device.id}
                  style={styles.deviceItem}
                  onPress={() => {
                    setDict(device.id)
                    handleConnect(device.id);
                    setDeviceName(device.name);
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles.deviceText}>
                    {device.name || 'Unnamed Device'}{' '}
                    {device.connected ? '(Connected)' : ''}
                  </Text>
                </TouchableOpacity>
              ))
            )}

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      <BleReceiver ref={bleReceiverRef} onDeviceUpdate={(newDevices: DeviceInfo[]) => {
                                        setDevices((prevDevices) => {
                                          const merged = [...prevDevices];
                                          
                                          newDevices.forEach(nd => {
                                            const existingIdx = merged.findIndex(d => d.id === nd.id || d.name === nd.name);
                                            if (existingIdx >= 0) {
                                              merged[existingIdx] = {...merged[existingIdx], ...nd};
                                            } else {
                                              merged.push(nd);
                                            }
                                          });
                                          return merged
                                          .filter(d => d.name && d.name !== 'Unknown')
                                          .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
                                        });
                                        }} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  innerContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#E0F2FE',
    marginBottom: 40,
  },
  card: {
    width: '80%',
    backgroundColor: 'rgba(17, 24, 39, 0.9)',
    borderRadius: 16,
    paddingVertical: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
    marginBottom: 40,
  },
  phText: {
    fontSize: 48,
    fontWeight: '800',
    color: '#3B82F6',
  },
  subLabel: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 6,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 30,
  },
  button: {
    width: '70%',
    borderRadius: 14,
    overflow: 'hidden',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },
  connectBtn: {
    shadowColor: '#3B82F6',
  },
  disconnectBtn: {
    shadowColor: '#DC2626',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: '#111111D0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#E0F2FE',
    marginBottom: 16,
  },
  deviceItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#374151',
    width: '100%',
  },
  deviceText: {
    color: '#E0F2FE',
    fontSize: 16,
    textAlign: 'center',
  },
  modalText: {
    color: '#9CA3AF',
    fontSize: 16,
    marginBottom: 20,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  closeText: {
    color: '#F9FAFB',
    fontSize: 16,
    fontWeight: '600',
  },
});
