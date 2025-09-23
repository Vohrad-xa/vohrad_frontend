import {StyleSheet, Platform} from 'react-native';
import {StatusBar} from 'expo-status-bar';

import {ThemedText, ThemedView} from '@/components/ui';
import {useTheme} from '@/providers';

export default function SettingsModal() {
  const {ds} = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: ds.layout.screenPadding,
    },
  });

  return (
    <ThemedView style={styles.container}>
      <ThemedText variant="title1">Settings</ThemedText>
      <ThemedText variant="body">App settings will be displayed here.</ThemedText>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </ThemedView>
  );
}