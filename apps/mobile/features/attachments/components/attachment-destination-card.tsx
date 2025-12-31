import React from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  type GestureResponderEvent,
} from 'react-native';
import {useRouter} from 'expo-router';
import {Card} from '@/components/cards/card';
import {ThemedText} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils';
import {AppIcons, Icon} from '@/utils/icons';

type AttachmentDestinationCardProps = {
  targetName?: string;
  targetType?: string;
  targetId?: string;
  onClear?: () => void;
};

export function AttachmentDestinationCard({
  targetName,
  targetType,
  targetId,
  onClear,
}: AttachmentDestinationCardProps) {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);
  const router = useRouter();
  const hasDestination = !!targetName && !!targetId;

  const handlePress = () => {
    router.push(
      targetId
        ? {
            pathname: '/(modals)/attachments',
            params: {selectedIds: targetId},
          }
        : '/(modals)/attachments',
    );
  };

  const handleClear = (e: GestureResponderEvent) => {
    e.stopPropagation();
    onClear?.();
  };

  return (
    <View style={styles.container}>
      <Card>
        <Pressable
          onPress={handlePress}
          accessibilityRole="button"
          accessibilityLabel="Select destination for attachment"
        >
          <View style={styles.cardContent}>
            <View style={styles.iconWrapper}>
              <Icon
                name={AppIcons.tabs.vault}
                size="md"
                color={theme.secondary}
              />
            </View>
            <View style={styles.textContent}>
              <ThemedText variant="label">
                {targetName ?? 'Select destination'}
              </ThemedText>
              {targetType && (
                <ThemedText variant="caption">{targetType}</ThemedText>
              )}
            </View>
            {hasDestination && onClear ? (
              <Pressable
                onPress={handleClear}
                style={styles.clearButton}
                accessibilityLabel="Clear destination"
                accessibilityRole="button"
              >
                <Icon name={AppIcons.ui.close} size="md" color={theme.muted} />
              </Pressable>
            ) : (
              <Icon
                name={AppIcons.ui.chevronRight}
                colorToken="muted"
                style={styles.chevron}
              />
            )}
          </View>
        </Pressable>
      </Card>
      <ThemedText variant="caption" style={styles.helperText}>
        Attachments will be associated with the resource you select. Choose
        where to store your files.
      </ThemedText>
    </View>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape, theme: ThemeShape) =>
    StyleSheet.create({
      container: {
        width: '100%',
      },
      cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
      },
      iconWrapper: {
        width: 28,
        height: 28,
        marginRight: ds.spacing.lg,
        backgroundColor: theme.card,
        borderRadius: ds.spacing.md,
        justifyContent: 'center',
        alignItems: 'center',
      },
      textContent: {
        flex: 1,
      },
      chevron: {
        marginLeft: ds.spacing.lg,
      },
      clearButton: {
        padding: ds.spacing.sm,
        marginLeft: ds.spacing.sm,
      },
      helperText: {
        marginTop: ds.spacing.sm,
        marginHorizontal: ds.spacing.lg,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
