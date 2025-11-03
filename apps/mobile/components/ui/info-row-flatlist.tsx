import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Image,
  View,
  type ImageSourcePropType,
} from 'react-native';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {AppIcons, Icon} from '@/utils/icons';
import {makeStyleFactory} from '@/utils/style-factory';
import {ThemedText} from './themed-text';
import {ThemedView, type BadgeStatus} from './themed-view';

export type ListRowData = {
  id: string;
  name: string;
  code?: string;
  image?: ImageSourcePropType;
  badge?: string;
  badgeType?: BadgeStatus;
  count?: number;
  onPress?: () => void;
};

export type ListPosition = 'first' | 'middle' | 'last' | 'single';

type ListRowProps = {
  item: ListRowData;
  showImage?: boolean;
  showBadge?: boolean;
  imageContainerSize?: number;
  position?: ListPosition;
};

export const ListRow: React.FC<ListRowProps> = React.memo(
  ({
    item,
    showImage = true,
    showBadge = true,
    imageContainerSize = 35,
    position = 'single',
  }) => {
    const {ds, theme} = useTheme();
    const styles = createStyles(theme, ds, position);

    const hasSecondaryContent =
      item.code ??
      (showBadge && item.badge) ??
      (item.count !== undefined && item.count > 0);

    const content = (
      <>
        {showImage && (
          <View
            style={[
              styles.imageWrapper,
              {width: imageContainerSize, height: imageContainerSize},
            ]}
          >
            <View style={styles.imageContainer}>
              {item.image ? (
                <Image
                  source={item.image}
                  style={styles.image}
                  resizeMode="cover"
                />
              ) : (
                <Icon name={AppIcons.content.imageFallback} size="xl" />
              )}
            </View>
            {showBadge && item.badge && (
              <ThemedView
                variant="statusBadge"
                badgeStatus={item.badgeType}
                style={styles.imageBadge}
              />
            )}
          </View>
        )}

        <View style={styles.contentContainer}>
          <ThemedText variant="label" numberOfLines={1}>
            {item.name}
          </ThemedText>
          {hasSecondaryContent && (
            <View style={styles.secondaryRow}>
              {item.code && (
                <ThemedText
                  variant="caption"
                  colorToken="muted"
                  style={styles.secondaryItem}
                >
                  {item.code}
                </ThemedText>
              )}
              {item.count !== undefined && item.count > 0 && (
                <ThemedText
                  variant="caption"
                  colorToken="muted"
                  style={styles.secondaryItem}
                >
                  {item.count} {item.count === 1 ? 'item' : 'items'}
                </ThemedText>
              )}
            </View>
          )}
        </View>

        {item.onPress && <Icon name={AppIcons.navigation.chevron} />}
      </>
    );

    return (
      <View style={styles.rowContainer}>
        {item.onPress ? (
          <TouchableOpacity
            style={styles.touchableContent}
            onPress={item.onPress}
            accessibilityRole="button"
            accessibilityLabel={item.name}
          >
            {content}
          </TouchableOpacity>
        ) : (
          <View style={styles.touchableContent}>{content}</View>
        )}
      </View>
    );
  },
);

ListRow.displayName = 'ListRow';

const createStyles = makeStyleFactory(
  (theme: ThemeShape, ds: DSShape, _position: ListPosition) =>
    StyleSheet.create({
      rowContainer: {
        backgroundColor: 'transparent',
      },
      touchableContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: ds.spacing.lg,
        // paddingHorizontal: ds.spacing.md,
        gap: ds.spacing.lg,
        minHeight: ds.components.tapTarget.minSize,
      },
      imageWrapper: {
        position: 'relative',
        alignItems: 'center',
      },
      imageContainer: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: ds.borderRadius.lg,
        backgroundColor: theme.surface,
      },
      imageBadge: {
        position: 'absolute',
        bottom: -8,
        alignSelf: 'center',
      },
      image: {
        width: '100%',
        height: '100%',
        borderRadius: ds.borderRadius.md,
      },
      contentContainer: {
        flex: 1,
        justifyContent: 'center',
        gap: ds.spacing.xxs,
      },
      secondaryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: ds.spacing.sm,
      },
      secondaryItem: {
        flexShrink: 0,
      },
    }),
  (theme, ds, position) => `${themeKey(theme, ds)}|${position}`,
);
