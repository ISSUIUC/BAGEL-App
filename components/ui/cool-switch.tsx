import { ThemedText } from '@/components/themed-text';
import React, { useState } from 'react';
import { StyleSheet, Switch } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const CoolSwitch = ({
  switchName,
}: {
  switchName: string;
}) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);
  const [isDisabled, setIsDisabled] = useState(false);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <ThemedText>Hello</ThemedText>
        <Switch
          trackColor={{false: '#767577', true: '#912F56'}}
          thumbColor={isEnabled ? '#F0A6CA' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleSwitch}
          value={isEnabled}
          disabled={isDisabled}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default CoolSwitch;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});