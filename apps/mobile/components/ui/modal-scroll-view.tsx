import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import type {ScrollViewProps} from 'react-native';
import type {DesignSystem} from '@/constants/typography';
import {useTheme} from '@/providers';

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

  const scrollViewContent = (
    <ScrollView
      contentContainerStyle={[styles.defaultContent, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentInsetAdjustmentBehavior={
        Platform.OS === 'ios' ? 'automatic' : undefined
      }
      nestedScrollEnabled={Platform.OS === 'android'}
      overScrollMode={Platform.OS === 'android' ? 'always' : undefined}
      {...props}
    >
      {children}
    </ScrollView>
  );

  return Platform.OS === 'ios' ? (
    <KeyboardAvoidingView behavior="padding" style={styles.container}>
      {scrollViewContent}
    </KeyboardAvoidingView>
  ) : (
    <KeyboardAvoidingView behavior="height" style={styles.container}>
      {scrollViewContent}
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
