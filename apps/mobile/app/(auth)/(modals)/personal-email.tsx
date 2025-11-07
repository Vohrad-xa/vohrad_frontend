import React from 'react';
import {Platform, StyleSheet} from 'react-native';
import {ThemedView, ModalScrollView} from '@/components/ui';
import {PersonalEmailForm} from '@/features/auth';
import {makeStyleFactory} from '@/utils';

export default function PersonalEmailModal() {
  const handleSuccess = () => {};
  const styles = createStyles();

  return (
    <ThemedView style={styles.container}>
      <ModalScrollView
        contentContainerStyle={
          Platform.OS === 'web' && {
            flexGrow: 1,
            justifyContent: 'center',
          }
        }
      >
        <PersonalEmailForm onSuccess={handleSuccess} />
      </ModalScrollView>
    </ThemedView>
  );
}

const createStyles = makeStyleFactory(
  () =>
    StyleSheet.create({
      container: {flex: 1},
    }),
  () => 'personal-email-modal',
);
