import React, {useEffect, useRef, useState} from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import {Divider} from 'react-native-paper';
import {ThemedText} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils';

type ListStatusHeaderProps = {
  isLoading?: boolean;
  lastUpdated?: Date | null;
};

const TIME_UPDATE_INTERVAL_MS = 60_000;

function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 1000 / 60);

  if (minutes === 0) return 'Updated Just Now';
  if (minutes < 60) return `Updated ${minutes}m ago`;

  return `Updated at ${date.toLocaleTimeString([], {hour: 'numeric', minute: '2-digit'})}`;
}

/**
 * Status header for lists showing live update status.
 *
 * Displays "Updated just now", "Updating…", or relative timestamps.
 * Designed for use as a FlashList/FlatList `ListHeaderComponent`.
 */
export const ListStatusHeader = ({
  isLoading = false,
  lastUpdated: lastUpdatedProp = null,
}: ListStatusHeaderProps) => {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);
  const wasLoadingRef = useRef(isLoading);

  const [lastUpdated, setLastUpdated] = useState<Date | null>(lastUpdatedProp);
  const [statusText, setStatusText] = useState(() =>
    lastUpdatedProp ? formatRelativeTime(lastUpdatedProp) : 'Updating …',
  );

  // Sync externally-provided lastUpdated prop into local state
  useEffect(() => {
    if (lastUpdatedProp) {
      setLastUpdated(lastUpdatedProp);
      setStatusText(formatRelativeTime(lastUpdatedProp));
    }
  }, [lastUpdatedProp]);

  // Track loading state transitions to update timestamp on completion
  useEffect(() => {
    const wasLoading = wasLoadingRef.current;
    wasLoadingRef.current = isLoading;

    if (wasLoading && !isLoading) {
      setLastUpdated(new Date());
      setStatusText('Updated Just Now');
    } else if (!wasLoading && isLoading) {
      setStatusText((prev) => prev ?? 'Updating …');
    }
  }, [isLoading]);

  // Refresh relative time display periodically when idle
  useEffect(() => {
    if (isLoading || !lastUpdated) return;

    setStatusText(formatRelativeTime(lastUpdated));

    const intervalId = setInterval(() => {
      setStatusText(formatRelativeTime(lastUpdated));
    }, TIME_UPDATE_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [isLoading, lastUpdated]);

  return (
    <View>
      <View style={styles.container}>
        <ThemedText
          variant="subheadline"
          colorToken="muted"
          accessibilityLiveRegion="polite"
          accessibilityLabel={statusText}
        >
          {statusText}
        </ThemedText>
        <ActivityIndicator
          size="small"
          color={theme.muted}
          style={[styles.indicator, {opacity: isLoading ? 1 : 0}]}
        />
      </View>
      <Divider style={styles.divider} />
    </View>
  );
};

const createStyles = makeStyleFactory(
  (ds: DSShape, _: ThemeShape) =>
    StyleSheet.create({
      container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: ds.spacing.md,
        paddingHorizontal: ds.spacing.lg + 1,
      },
      indicator: {
        transform: [{scale: 0.75}],
        marginLeft: ds.spacing.xs,
      },
      divider: {
        marginHorizontal: ds.spacing.lg,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
