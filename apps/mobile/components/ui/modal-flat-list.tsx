import React from 'react';
import {Platform, FlatList} from 'react-native';
import type {FlatListProps} from 'react-native';
import {usePullToRefresh} from '@/hooks';

type ModalFlatListProps<T> = FlatListProps<T> & {
  children?: never;
  onRefresh?: () => void | Promise<void>;
};

export function ModalFlatList<T>({onRefresh, ...props}: ModalFlatListProps<T>) {
  const {refreshControl} = usePullToRefresh({onRefresh});

  return (
    <FlatList
      {...props}
      refreshControl={refreshControl}
      contentInsetAdjustmentBehavior={
        Platform.OS === 'ios' ? 'automatic' : undefined
      }
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={Platform.OS === 'web'}
      keyboardDismissMode={Platform.select({
        ios: 'interactive',
        default: 'on-drag',
      })}
    />
  );
}
