import SwitchModel from '@/components/SwitchModel';
import SwitchRow from '@/components/ui/switch-row';
import { useState } from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function App() {
  // 1. Initialize 6 dummy data objects
  const [switches, setSwitches] = useState([
    new SwitchModel("01", "Disconnected", false),
    new SwitchModel("02", "Blue Raven", false),
    new SwitchModel("03", "CAM", true),
    new SwitchModel("04", "TeleMega Pyro", false),
    new SwitchModel("05", "TeleMega Power", true),
    new SwitchModel("06", "MIDAS", false),
  ]);

  // 2. Handler to toggle the switch state in the array
  const handleToggle = (id) => {
    setSwitches((currentSwitches) =>
      currentSwitches.map((item) => {
        if (item.id === id) {
          // Return a new object with the toggled state
          return { ...item, isActive: !item.isActive };
        }
        return item;
      })
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>System Control</Text>
      </View>

      <FlatList
        data={switches}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SwitchRow
            switchNum={item.id}
            switchName={item.name}
            status={item.isActive ? "Active" : "Inactive"}
            isEnabled={item.isActive}
            toggleSwitch={() => handleToggle(item.id)}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2c3e50',
  },
});