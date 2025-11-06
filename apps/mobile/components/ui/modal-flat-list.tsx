import React from 'react';
import {Platform, FlatList, StyleSheet} from 'react-native';
import type {FlatListProps} from 'react-native';
import {type DSShape} from '@/constants/theme';
import {usePullToRefresh} from '@/hooks';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils/style-factory';

type ModalFlatListProps<T> = FlatListProps<T> & {
  children?: never;
  onRefresh?: () => void | Promise<void>;
};

export function ModalFlatList<T>({
  contentContainerStyle,
  onRefresh,
  ...props
}: ModalFlatListProps<T>) {
  const {ds} = useTheme();
  const styles = createStyles(ds);
  const {refreshControl} = usePullToRefresh({onRefresh});

  return (
    <FlatList
      {...props}
      contentContainerStyle={[styles.defaultContent, contentContainerStyle]}
      refreshControl={refreshControl}
      showsVerticalScrollIndicator={Platform.OS === 'web'}
      keyboardDismissMode={Platform.select({
        ios: 'interactive',
        default: 'on-drag',
      })}
    />
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
