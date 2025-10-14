import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  FlatList,
  StyleSheet,
} from 'react-native';
import type {FlatListProps} from 'react-native';
import {useTheme} from '@/providers';

type ModalFlatListProps<T> = FlatListProps<T> & {
  children?: never;
};

export function ModalFlatList<T>({
  contentContainerStyle,
  ...props
}: ModalFlatListProps<T>) {
  const {ds} = useTheme();

  const defaultContentStyle = {
    paddingTop: ds.spacing.lg,
    paddingHorizontal: ds.spacing.xl,
    paddingBottom: ds.spacing.xxl,
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <FlatList
        contentContainerStyle={[defaultContentStyle, contentContainerStyle]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentInsetAdjustmentBehavior="automatic"
        {...props}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
});
