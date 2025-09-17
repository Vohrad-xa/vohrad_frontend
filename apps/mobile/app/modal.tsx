import { Link } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/ui/themed-text';
import { ThemedView } from '@/components/ui/themed-view';
import { useTheme } from '@/providers/theme-provider';

export default function ModalScreen() {
  const { ds } = useTheme();

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
      <ThemedText variant="title1">This is a modal</ThemedText>
      <Link href="/" dismissTo style={styles.link}>
        <ThemedText variant="interactive" colorToken="primary">
          Go to home screen
        </ThemedText>
      </Link>
    </ThemedView>
  );
}
