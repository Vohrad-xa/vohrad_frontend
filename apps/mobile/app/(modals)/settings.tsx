import {StyleSheet, Platform} from 'react-native';
import {Link, router} from 'expo-router';
import {StatusBar} from 'expo-status-bar';

import {ThemedText, ThemedView} from '@/components/ui';
import {useTheme} from '@/providers';

export default function SettingsModal() {
  const {ds} = useTheme();
  const isPresented = router.canGoBack();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: ds.layout.screenPadding,
    },
    link: {
      marginTop: ds.spacing.lg,
      paddingVertical: ds.spacing.lg,
    },
  });

  return (
    <ThemedView style={styles.container}>
      <ThemedText variant="title1">Settings</ThemedText>
      <ThemedText variant="body">App settings will be displayed here.</ThemedText>
      {isPresented && (
        <Link href="../" style={styles.link}>
          <ThemedText variant="interactive" colorToken="primary">
            Dismiss
          </ThemedText>
        </Link>
      )}
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </ThemedView>
  );
}