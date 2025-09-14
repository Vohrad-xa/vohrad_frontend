import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.headerContainer}>
        <ThemedText type="title" style={styles.title}>
          Vohrad
        </ThemedText>
        <ThemedText style={styles.subtitle}>Welcome to your application</ThemedText>
      </ThemedView>

      <ThemedView style={styles.contentContainer}>
        <ThemedText>Your app is ready to use. Start building your features!</ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    opacity: 0.7,
    textAlign: 'center',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
});
