import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  FlatList,
  StyleSheet,
} from 'react-native';
import type {FlatListProps} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {type DSShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils/style-factory';

type ModalFlatListProps<T> = FlatListProps<T> & {
  children?: never;
};

export function ModalFlatList<T>({
  contentContainerStyle,
  ...props
}: ModalFlatListProps<T>) {
  const {ds} = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(ds, insets.bottom);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <FlatList
        contentContainerStyle={[styles.defaultContent, contentContainerStyle]}
        showsVerticalScrollIndicator={Platform.OS === 'web'}
        keyboardShouldPersistTaps="handled"
        contentInsetAdjustmentBehavior={
          Platform.OS === 'ios' ? 'automatic' : undefined
        }
        {...props}
      />
    </KeyboardAvoidingView>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape, bottomInset: number) =>
    StyleSheet.create({
      container: {
        flex: 1,
      },
      defaultContent: {
        paddingTop: ds.spacing.lg,
        paddingHorizontal: ds.spacing.xl,
        paddingBottom: bottomInset,
      },
    }),
  (ds, bottomInset) => `${ds.version}|${bottomInset}`,
);
