import React from 'react';
import {Platform, FlatList, StyleSheet} from 'react-native';
import type {FlatListProps} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
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
  const styles = createStyles(ds);

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={[styles.defaultContent, contentContainerStyle]}
      showsVerticalScrollIndicator={Platform.OS === 'web'}
      keyboardShouldPersistTaps="handled"
      contentInsetAdjustmentBehavior="automatic"
      bottomOffset={0}
      enabled
      extraKeyboardSpace={0}
    >
      <FlatList
        {...props}
        contentContainerStyle={undefined}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
      />
    </KeyboardAwareScrollView>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape) =>
    StyleSheet.create({
      defaultContent: {
        paddingTop: ds.spacing.lg,
        paddingHorizontal: ds.spacing.xl,
        paddingBottom: ds.spacing.xxl,
      },
    }),
  (ds) => ds.version.toString(),
);
