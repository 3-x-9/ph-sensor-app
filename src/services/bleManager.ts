import { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { BleManager } from 'react-native-ble-plx';
import { Buffer } from 'buffer';

type BleRecieverProps = {
    onDeviceUpdate: (devices: DeviceInfo[]) => void;
};

type DeviceInfo = {
    id: string;
    name: string | null;
    connected: boolean;
    value: string;
};

export type BleRecieverRef = {
    handleConnect: (deviceId: string) => void;
};

const BleReceiver = forwardRef<BleRecieverRef, BleRecieverProps>(({ onDeviceUpdate }, ref) => {
    const [devices, setDevices] = useState<DeviceInfo[]>([]);
    const [bleManager, setBleManager] = useState<BleManager | null>(null);
    const PH_SERVICE_UUID = "b197db85-f1d2-4023-a9f1-ceda630dd39b";
    const PH_READ_UUID = "70ceca29-8ff7-49af-8896-790d7bb30967";
    const CALIB_WRITE_UUID = "8a1f9b2e-1234-5678-9abc-def012345678";
    const [activeDevice, setActiveDevice] = useState<DeviceInfo | null>(null);
    const getActiveDevice = () => activeDevice;

    useEffect(() => {
        const manager = new BleManager();
        setBleManager(manager);

        const subscription = manager.onStateChange((state) => {
            if (state === 'PoweredOn') {
                scanDevices(manager);
                subscription.remove();
            }
        }, true);

        return () => {
            manager.destroy(); // clean up
        };
    }, []);

    useEffect(() => {
        onDeviceUpdate(devices);
    }, [devices]);

    useImperativeHandle(ref, () => ({
        handleConnect,
        handleDisconnect,
        sendCalibration,
        getActiveDevice,
    }));

    const scanDevices = (manager: BleManager) => {
        manager.startDeviceScan(null, null, (error, device) => {
            if (error) return console.error('Scan error:', error);

            if (device) {
                setDevices(prev => {
                    if (prev.some(d => d.id === device.id)) return prev;
                    return [...prev,
                        {id: device.id, name: device.name ?? "Unknown", connected: false,
                            value: device.value ? device.value.toString("utf-8") : "0.0" },
                    ];
                });
                }
        });
    };

    const handleConnect = (deviceId: string) => {
        const device = devices.find(d => d.id === deviceId);
        if (!device || !bleManager) return;
        console.log("device", device);
        bleManager.stopDeviceScan();
        connectToDevice(device);
        setActiveDevice(device);
    };

    const handleDisconnect = async (deviceId: string) => {
        if (!bleManager) return;
        try {
            await bleManager.cancelDeviceConnection(deviceId);
            console.log(`disconnecting from ${deviceId}`);
            setDevices(prev => prev.map(d => d.id === deviceId ? {...d, connected: false} : d));
        } catch (e) {
            console.warn("Disconnection error: ", e)
        }
    };

    const sendCalibration = async (deviceId: string, calibrationData: { m: number, b: number }) => {
        if (!bleManager) return;
        try {
            const device = await bleManager.devices([deviceId]);
            if (!device.length) return;
            const d = device[0];

            const payload = JSON.stringify(calibrationData);
            const base64Value = Buffer.from(payload, 'utf8').toString('base64');

            await d.writeCharacteristicWithResponseForService(PH_SERVICE_UUID,
                                                                CALIB_WRITE_UUID,
                                                                base64Value,
            );
            console.log("calibration Sent: ", calibrationData);
        } catch (e) {
            console.warn(e);
        }
    };

    const base64ToFloatLE = (base64?: string | null) => {
        if (!base64) return 0;
        const buffer = Buffer.from(base64, "base64");
        if (buffer.length < 4) return 0;
        const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
        return view.getFloat32(0, true);
    };

    const connectToDevice = async (deviceInfo: DeviceInfo) => {
        if (!bleManager) return;

        try {
            const connectedDevice = await bleManager.connectToDevice(deviceInfo.id);
            await connectedDevice.discoverAllServicesAndCharacteristics();

            setDevices(prev => prev.map(d =>
                d.id === deviceInfo.id ? { ...d, connected: true } : d
            ));

            connectedDevice.onDisconnected(() => {
                console.log("disconnected", deviceInfo.id);
                setDevices(prev => prev.map(d => d.id === deviceInfo.id ? { ...d, connected: false } : d));
                return () => {
                    bleManager.cancelDeviceConnection(deviceInfo.id);
                };
            });

            connectedDevice.monitorCharacteristicForService(
                PH_SERVICE_UUID, // BLE service uuid
                PH_READ_UUID, // Characteristics uuid
                (error, characteristic) => {
                    if (error) return console.warn(error);

                    const decodedValue = base64ToFloatLE(characteristic!.value!);
                    console.log("recieved data:", decodedValue)
                    setDevices(prev => prev.map(d =>
                        d.id === deviceInfo.id ? { ...d, value: decodedValue.toFixed(2) } : d
                    ));
                }
            );
        } catch (error) {
            console.warn('Connection error:', error);
        }
    };

    return null;
});

export default BleReceiver;
