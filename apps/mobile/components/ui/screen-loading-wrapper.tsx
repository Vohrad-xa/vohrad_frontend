import React, {type ReactNode} from 'react';
import {View, StyleSheet} from 'react-native';
import {useLoading} from '@/providers';
import {LoadingOverlay} from './loading-overlay';

type ScreenLoadingWrapperProps = {
  children: ReactNode;
};

// Wraps a screen/modal and shows loading overlay when active.

export function ScreenLoadingWrapper({children}: ScreenLoadingWrapperProps) {
  const {isLoading, forceLoading} = useLoading();
  const isActive = isLoading || forceLoading;

  return (
    <View style={styles.container}>
      {children}
      {isActive && <LoadingOverlay fullScreen />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
