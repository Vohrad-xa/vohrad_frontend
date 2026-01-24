import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
  type ImageSourcePropType,
} from 'react-native';
import {Image as ExpoImage} from 'expo-image';
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
  loading?: boolean;
  onPress?: () => void;
};

export type ListPosition = 'first' | 'middle' | 'last' | 'single';

type ListRowProps = {
  item: ListRowData;
  showImage?: boolean;
  showBadge?: boolean;
  imageContainerSize?: number;
  position?: ListPosition;
  customLeftIcon?: React.ReactNode;
  showChevron?: boolean;
};

export const ListRow: React.FC<ListRowProps> = React.memo(
  ({
    item,
    showImage = true,
    showBadge = true,
    imageContainerSize = 40,
    position = 'single',
    customLeftIcon,
    showChevron = true,
  }) => {
    const {ds, theme} = useTheme();
    const styles = createStyles(theme, ds, position);

    const hasSecondaryContent =
      item.code ??
      (showBadge && item.badge) ??
      (item.count !== undefined && item.count > 0);

    const content = (
      <>
        {customLeftIcon ? (
          <View>{customLeftIcon}</View>
        ) : (
          showImage && (
            <View
              style={[
                styles.imageWrapper,
                {width: imageContainerSize, height: imageContainerSize},
              ]}
            >
              <View style={styles.imageContainer}>
                {item.image ? (
                  <ExpoImage
                    source={item.image}
                    style={styles.image}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                    transition={150}
                  />
                ) : (
                  <Icon name={AppIcons.files.image} size="xl" />
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
          )
        )}

        <View style={styles.contentContainer}>
          <ThemedText variant="label" numberOfLines={1}>
            {item.name}
          </ThemedText>
          {hasSecondaryContent && (
            <View style={styles.secondaryRow}>
              {item.code && (
                <ThemedText
                  variant="footnote"
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

        {item.onPress && showChevron && !item.loading && (
          <Icon name={AppIcons.actions.forward} size="md" />
        )}
        {item.onPress && item.loading && (
          <ActivityIndicator size="small" color={theme.accentBlue} />
        )}
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
        paddingVertical: ds.spacing.md,
        gap: ds.spacing.md,
        minHeight: ds.components.tapTarget.minSize,
      },
      imageWrapper: {
        position: 'relative',
        alignItems: 'center',
        marginRight: ds.spacing.md,
      },
      imageContainer: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: ds.borderRadius.full,
        backgroundColor: theme.background,
      },
      imageBadge: {
        position: 'absolute',
        bottom: -8,
        alignSelf: 'center',
      },
      image: {
        width: '100%',
        height: '100%',
        borderRadius: ds.borderRadius.full,
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
