import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  FlatList,
  StyleSheet,
} from 'react-native';
import type {FlatListProps} from 'react-native';
import type {DesignSystem} from '@/constants/typography';
import {useTheme} from '@/providers';

type ModalFlatListProps<T> = FlatListProps<T> & {
  children?: never;
};

export function ModalFlatList<T>({
  contentContainerStyle,
  ...props
}: ModalFlatListProps<T>) {
  const {ds} = useTheme();
  const styles = createStyles(ds);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <FlatList
        contentContainerStyle={[styles.defaultContent, contentContainerStyle]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentInsetAdjustmentBehavior="automatic"
        {...props}
      />
    </KeyboardAvoidingView>
  );
}

const createStyles = (ds: typeof DesignSystem) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    defaultContent: {
      paddingTop: ds.spacing.lg,
      paddingHorizontal: ds.spacing.xl,
      paddingBottom: ds.spacing.xxl,
    },
  });
