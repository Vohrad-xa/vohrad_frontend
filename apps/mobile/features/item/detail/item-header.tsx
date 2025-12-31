import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Image} from 'expo-image';
import {ThemedText, ThemedView} from '@/components/ui';
import {Tokens} from '@/constants/colors';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {Icon, AppIcons} from '@/utils';
import {makeStyleFactory} from '@/utils/style-factory';
import type {Item} from '@sykamore/types';

interface ItemHeaderProps {
  item: Item;
  imageUrl?: {uri: string} | undefined;
}

export function ItemHeader({item, imageUrl}: ItemHeaderProps) {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);

  return (
    <View style={styles.container}>
      {/* Status Badge */}
      <View style={styles.badgeContainer}>
        <ThemedView
          variant="statusBadge"
          badgeStatus={item.is_active ? 'active' : 'inactive'}
        >
          <ThemedText variant="caption" style={{color: Tokens.dark.text}}>
            {item.is_active ? 'Active' : 'Inactive'}
          </ThemedText>
        </ThemedView>
      </View>

      {/* Thumbnail */}
      <View style={styles.imageSection}>
        <View style={styles.imageContainer}>
          {imageUrl ? (
            <Image
              source={imageUrl}
              style={styles.thumbnail}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={200}
            />
          ) : (
            <Icon name={AppIcons.files.image} size="xxl" />
          )}
        </View>
      </View>

      {/* Name and SKU*/}
      <View style={styles.titleContainer}>
        <ThemedText style={styles.itemName} numberOfLines={2}>
          {item.name}
        </ThemedText>
        <ThemedText style={styles.itemCode} numberOfLines={1}>
          {item.sku.toUpperCase()}
        </ThemedText>
      </View>
    </View>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape, theme: ThemeShape) =>
    StyleSheet.create({
      container: {
        alignItems: 'center',
        position: 'relative',
      },
      badgeContainer: {
        position: 'absolute',
        top: ds.spacing.xs,
        right: ds.spacing.xs,
      },
      imageSection: {
        marginBottom: ds.spacing.md,
      },
      imageContainer: {
        width: ds.spacing.xxxl * 2,
        height: ds.spacing.xxxl * 2,
        borderRadius: ds.borderRadius.full,
        backgroundColor: theme.background,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
      },
      thumbnail: {
        width: '100%',
        height: '100%',
      },
      titleContainer: {
        alignItems: 'center',
        gap: ds.spacing.xs,
      },
      itemName: {
        ...ds.typography.heading,
        textAlign: 'center',
        flexShrink: 0,
      },
      itemCode: {
        ...ds.typography.caption,
        color: theme.muted,
        flexShrink: 0,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
