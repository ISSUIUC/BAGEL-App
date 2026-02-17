import { StyleSheet, Switch, Text, View } from 'react-native';

const SwitchRow = ({ switchNum, switchName, status, isEnabled, toggleSwitch }) => {
  return (
    <View style={styles.container}>
      {/* Left: Number and Label */}
      <View style={styles.leftSection}>
        <Text style={styles.numText}>{switchNum}</Text>
        <Text style={styles.nameText}>{switchName}</Text>
      </View>

      {/* Right: Status and Toggle */}
      <View style={styles.rightSection}>
        <Text style={[
          styles.statusText, 
          { color: isEnabled ? '#2ecc71' : '#95a5a6' }
        ]}>
          {status}
        </Text>
        <Switch
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleSwitch}
          value={isEnabled}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  numText: {
    fontSize: 14,
    color: '#888',
    marginRight: 12,
    fontWeight: '600',
    minWidth: 20,
  },
  nameText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    marginRight: 10,
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
});

export default SwitchRow;