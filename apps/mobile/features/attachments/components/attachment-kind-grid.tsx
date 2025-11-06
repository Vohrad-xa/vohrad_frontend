import React from 'react';
import {Platform, Pressable, StyleSheet, View} from 'react-native';
import {SymbolView} from 'expo-symbols';
import {ThemedText} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {Icon, AppIcons, SFSymbols} from '@/utils';
import {makeStyleFactory} from '@/utils/style-factory';

type AttachmentKindKey = 'image' | 'document' | 'video' | 'archive' | 'other';

export interface AttachmentKindTile {
  kind: AttachmentKindKey;
  label: string;
  count: number;
  onPress?: () => void;
}

interface AttachmentKindGridProps {
  tiles: AttachmentKindTile[];
}

const COLUMNS = 3;

export function AttachmentKindGrid({tiles}: AttachmentKindGridProps) {
  const {ds, theme} = useTheme();
  const styles = useStyles(ds, theme);

  return (
    <View style={styles.grid}>
      {tiles.map((tile) => (
        <Pressable
          key={tile.kind}
          style={styles.folder}
          onPress={tile.onPress}
          accessibilityRole="button"
          accessibilityLabel={`${tile.label} attachments`}
        >
          {Platform.OS === 'ios' ? (
            <SymbolView
              name={SFSymbols.folderFill}
              size={80}
              tintColor={theme.accentLightBlue}
            />
          ) : (
            <Icon
              name={AppIcons.content.folderFilled}
              size={80}
              color={theme.accentLightBlue}
            />
          )}
          <ThemedText variant="label" style={styles.label}>
            {tile.label}
          </ThemedText>
          <ThemedText variant="caption" style={styles.count}>
            {tile.count} {tile.count === 1 ? 'file' : 'files'}
          </ThemedText>
        </Pressable>
      ))}
    </View>
  );
}

const useStyles = makeStyleFactory(
  (ds: DSShape, theme: ThemeShape) =>
    StyleSheet.create({
      grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
      },
      folder: {
        width: `${100 / COLUMNS}%`,
        alignItems: 'center',
        paddingVertical: ds.spacing.md,
      },
      label: {
        marginTop: ds.spacing.sm,
      },
      count: {
        color: theme.muted,
        marginTop: ds.spacing.xs,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
