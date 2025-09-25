import React from 'react';
import {StyleSheet} from 'react-native';
import {ThemedText, ThemedView} from '@/components/ui';

export default function PersonalEmailModal() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText variant="title1">Personal Email</ThemedText>
      <ThemedText>personal email login.</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
