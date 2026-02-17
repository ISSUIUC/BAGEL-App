import { useEffect, useState } from 'react';
import {
  Button,
  FlatList,
  NativeEventEmitter, NativeModules,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import BleManager from 'react-native-ble-manager';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const BleInterface = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [peripherals, setPeripherals] = useState(new Map());
  const [connectedDevice, setConnectedDevice] = useState(null);

  useEffect(() => {
    // 1. Initialize BleManager
    BleManager.start({ showAlert: false });

    // 2. Setup Listeners
    const discoverListener = bleManagerEmitter.addListener(
      'BleManagerDiscoverPeripheral',
      (peripheral) => {
        if (peripheral.name) {
          setPeripherals((map) => new Map(map.set(peripheral.id, peripheral)));
        }
      }
    );

    const stopListener = bleManagerEmitter.addListener('BleManagerStopScan', () => {
      setIsScanning(false);
      console.log('Scan stopped');
    });

    // 3. Check Permissions (Android Only)
    handleAndroidPermissions();

    return () => {
      discoverListener.remove();
      stopListener.remove();
    };
  }, []);

  const handleAndroidPermissions = () => {
    if (Platform.OS === 'android' && Platform.Version >= 23) {
      PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((result) => {
        if (!result) {
          PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
        }
      });
    }
  };


  const startScan = () => {
    if (!isScanning) {
      setPeripherals(new Map());

      // Explicitly define parameters to avoid bridge confusion
      const serviceUUIDs = []; // Empty array for all devices
      const seconds = 5;
      const allowDuplicates = true;
      const options = {}; // This MUST be an object to satisfy the 'Map' requirement

      BleManager.scan(serviceUUIDs, seconds, allowDuplicates, options)
        .then(() => {
          console.log('Scanning...');
          setIsScanning(true);
        })
        .catch((err) => {
          console.error('Scan error:', err);
        });
    }
  };

  const connectToDevice = (peripheral) => {
    BleManager.connect(peripheral.id)
      .then(() => {
        setConnectedDevice(peripheral);
        console.log('Connected to ' + peripheral.id);
        // Essential: Discover services/characteristics after connecting
        return BleManager.retrieveServices(peripheral.id);
      })
      .then((info) => {
        console.log('Device info:', info);
      })
      .catch((error) => console.log('Connection error', error));
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.deviceRow} 
      onPress={() => connectToDevice(item)}
    >
      <View>
        <Text style={styles.deviceName}>{item.name || 'Unnamed Device'}</Text>
        <Text style={styles.deviceId}>{item.id}</Text>
      </View>
      <Text style={styles.rssi}>RSSI: {item.rssi}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>BLE Scanner</Text>
        <Button 
          title={isScanning ? "Scanning..." : "Start Scan"} 
          onPress={startScan} 
          disabled={isScanning}
        />
      </View>

      {connectedDevice && (
        <View style={styles.connectedBanner}>
          <Text style={styles.connectedText}>Connected: {connectedDevice.name}</Text>
        </View>
      )}

      <FlatList
        data={Array.from(peripherals.values())}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.emptyText}>No devices found.</Text>}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold' },
  deviceRow: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#ddd', flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fff' },
  deviceName: { fontSize: 16, fontWeight: '600' },
  deviceId: { fontSize: 12, color: '#666' },
  rssi: { fontSize: 12, color: '#999' },
  connectedBanner: { backgroundColor: '#2ecc71', padding: 10, alignItems: 'center' },
  connectedText: { color: '#fff', fontWeight: 'bold' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#999' }
});

export default BleInterface;