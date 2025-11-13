import React from 'react';
import {Platform, StyleSheet, View} from 'react-native';
import {SymbolView} from 'expo-symbols';
import {ThemedText, ListRow, Divider, type ListRowData} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants';
import {useTheme} from '@/providers';
import {Icon, AppIcons, SFSymbols, makeStyleFactory} from '@/utils';
import type {AttachmentKind} from '@vohrad/types';

export interface AttachmentKindTile {
  kind: AttachmentKind;
  label: string;
  count: number;
  onPress?: () => void;
}

interface AttachmentKindGridProps {
  tiles: AttachmentKindTile[];
}

export function AttachmentKindGrid({tiles}: AttachmentKindGridProps) {
  const {ds, theme} = useTheme();
  const styles = useStyles(ds, theme);

  return (
    <View>
      {tiles.map((tile, index) => (
        <View key={tile.kind}>
          <ListRow
            item={{
              id: tile.kind,
              name: tile.label,
              code:
                tile.count > 0
                  ? `${tile.count} ${tile.count === 1 ? 'file' : 'files'}`
                  : undefined,
              onPress: tile.onPress,
            }}
            showImage={false}
            showBadge={false}
            position={
              tiles.length === 1
                ? 'single'
                : index === 0
                  ? 'first'
                  : index === tiles.length - 1
                    ? 'last'
                    : 'middle'
            }
            customLeftIcon={
              Platform.OS === 'ios' ? (
                <SymbolView
                  name={SFSymbols.folderFill}
                  size={55}
                  tintColor={theme.accentLightBlue}
                />
              ) : (
                <Icon
                  name={AppIcons.content.folderFilled}
                  size={55}
                  color={theme.accentLightBlue}
                />
              )
            }
          />
          {index < tiles.length - 1 && (
            <View style={styles.dividerContainer}>
              <Divider />
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

const useStyles = makeStyleFactory(
  (ds: DSShape, _theme: ThemeShape) =>
    StyleSheet.create({
      dividerContainer: {
        paddingLeft: ds.spacing.xxl + ds.spacing.xxl + 3,
        paddingRight: ds.spacing.xs,
      },
    }),
  (ds, _theme) => themeKey(_theme, ds),
);
