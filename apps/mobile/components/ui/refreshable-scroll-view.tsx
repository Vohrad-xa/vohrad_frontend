import React, {forwardRef} from 'react';
import {Platform, ScrollView, type ScrollViewProps} from 'react-native';
import {usePullToRefresh} from '@/hooks';

export interface RefreshableScrollViewProps extends ScrollViewProps {
  enableRefresh?: boolean;
  onRefresh?: () => void | Promise<void>;
}

type ScrollViewRef = React.ElementRef<typeof ScrollView>;

export const RefreshableScrollView = forwardRef<
  ScrollViewRef,
  RefreshableScrollViewProps
>(({enableRefresh = true, onRefresh, nestedScrollEnabled, ...rest}, ref) => {
  const {refreshControl} = usePullToRefresh(enableRefresh ? {onRefresh} : {});
  const androidNested = Platform.OS === 'android' ? true : undefined;

  return (
    <ScrollView
      ref={ref}
      refreshControl={enableRefresh ? refreshControl : undefined}
      nestedScrollEnabled={nestedScrollEnabled ?? androidNested}
      scrollEventThrottle={16}
      directionalLockEnabled={Platform.OS === 'android'}
      showsVerticalScrollIndicator={Platform.OS !== 'android'}
      {...rest}
    />
  );
});

RefreshableScrollView.displayName = 'RefreshableScrollView';

export default RefreshableScrollView;
