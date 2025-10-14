import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import type {ScrollViewProps} from 'react-native';
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

  const defaultContentStyle = {
    paddingTop: ds.spacing.lg,
    paddingHorizontal: ds.spacing.xl,
    paddingBottom: ds.spacing.xxl,
  };

  const scrollViewContent = (
    <ScrollView
      contentContainerStyle={[defaultContentStyle, contentContainerStyle]}
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

const styles = StyleSheet.create({
  container: {flex: 1},
});
