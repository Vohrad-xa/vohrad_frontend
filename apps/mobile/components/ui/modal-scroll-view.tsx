import React from 'react';
import {Platform, StyleSheet} from 'react-native';
import type {ScrollViewProps} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import {type DSShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils/style-factory';

type ModalScrollViewProps = ScrollViewProps & {
  children: React.ReactNode;
};

export function ModalScrollView({
  children,
  contentContainerStyle,
  ...props
}: ModalScrollViewProps) {
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
      {...props}
    >
      {children}
    </KeyboardAwareScrollView>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape) =>
    StyleSheet.create({
      defaultContent: {
        paddingTop: ds.spacing.lg,
        paddingHorizontal: ds.spacing.md,
        paddingBottom: ds.spacing.xl,
      },
    }),
  (ds) => ds.version.toString(),
);
