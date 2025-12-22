import React, {useMemo} from 'react';
import {StyleSheet, View, Platform} from 'react-native';
import {List, Divider} from 'react-native-paper';
import {ModalScrollView} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants';
import type {AttachmentKindCount} from '@/features/attachments/utils/attachment-counts';
import {useTheme} from '@/providers';
import {makeStyleFactory, Icon, AppIcons} from '@/utils';
import type {AttachmentKind} from '@sykamore/types';
import {
  Host,
  List as IOSList,
  Button,
  HStack,
  Label,
  Spacer,
  Text,
  font,
  foregroundStyle,
  padding,
} from '@/modules/sykamore-ui/src/ios';
import {tint} from '@/modules/sykamore-ui/src/ios/modifiers';

interface AttachmentKindTile {
  kind: AttachmentKind;
  label: string;
  count: number;
  onPress?: () => void;
  systemImage: string;
}

type AttachmentKindKey = AttachmentKindTile['kind'];

interface AttachmentsOverviewProps {
  counts: AttachmentKindCount;
  onTilePress?: Partial<Record<AttachmentKindKey, () => void>>;
}

export function AttachmentsOverview({
  counts,
  onTilePress,
}: AttachmentsOverviewProps) {
  const {ds, theme} = useTheme();
  const styles = useStyles(ds, theme);

  const tiles = useMemo<AttachmentKindTile[]>(
    () => [
      {
        kind: 'image' as const,
        label: 'Images',
        count: counts.image,
        onPress: onTilePress?.image,
        systemImage: 'photo',
      },
      {
        kind: 'document' as const,
        label: 'Documents',
        count: counts.document,
        onPress: onTilePress?.document,
        systemImage: 'doc',
      },
      {
        kind: 'archive' as const,
        label: 'Archives',
        count: counts.archive,
        onPress: onTilePress?.archive,
        systemImage: 'archivebox',
      },
      {
        kind: 'other' as const,
        label: 'Other',
        count: counts.other,
        onPress: onTilePress?.other,
        systemImage: 'questionmark.folder',
      },
    ],
    [counts, onTilePress],
  );

  if (Platform.OS === 'ios') {
    return (
      <Host style={{flex: 1}}>
        <IOSList listStyle="automatic" scrollEnabled>
          {tiles.map((tile) => {
            const countText =
              tile.count > 0
                ? `${tile.count} ${tile.count === 1 ? 'file' : 'files'}`
                : '0 files';

            return (
              <Button
                onPress={tile.onPress}
                modifiers={[tint(theme.text)]}
                key={tile.kind}
              >
                <HStack key={tile.kind}>
                  <Label
                    title={tile.label}
                    systemImage={tile.systemImage as any}
                  />
                  <Spacer />
                  <Text
                    modifiers={[
                      font({
                        size: ds.typography.secondary.fontSize,
                        weight: 'regular',
                      }),
                      foregroundStyle(theme.muted),
                      padding({horizontal: ds.spacing.md}),
                    ]}
                  >
                    {countText}
                  </Text>
                  <Icon
                    name={AppIcons.navigation.chevronRight}
                    useSwiftUI
                    noContainer
                  />
                </HStack>
              </Button>
            );
          })}
        </IOSList>
      </Host>
    );
  }

  return (
    <ModalScrollView>
      {tiles.map((tile, index) => (
        <View key={tile.kind}>
          <List.Item
            title={tile.label}
            description={
              tile.count > 0
                ? `${tile.count} ${tile.count === 1 ? 'file' : 'files'}`
                : undefined
            }
            left={() => (
              <Icon
                name={AppIcons.navigation.vault}
                size="xxl"
                color={theme.accentLightBlue}
              />
            )}
            onPress={tile.onPress}
            titleStyle={styles.title}
            descriptionStyle={styles.description}
          />
          {index < tiles.length - 1 && <Divider style={styles.divider} />}
        </View>
      ))}
    </ModalScrollView>
  );
}

const useStyles = makeStyleFactory(
  (ds: DSShape, theme: ThemeShape) =>
    StyleSheet.create({
      title: {
        ...ds.typography.label,
      },
      description: {
        color: theme.muted,
        ...ds.typography.caption,
      },
      divider: {
        marginLeft: ds.spacing.xxl + ds.spacing.xl,
        height: 1,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
