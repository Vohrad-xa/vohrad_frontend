import {useMemo} from 'react';
import {StyleSheet, View, Platform} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {List, Divider, Chip} from 'react-native-paper';
import {ThemedText} from '@/components/ui';
import {Palette, themeKey, type DSShape, type ThemeShape} from '@/constants';
import {useTheme} from '@/providers';
import {makeStyleFactory, Icon, AppIcons, type IconName} from '@/utils';
import {
  Host,
  List as IOSList,
  Button,
  HStack,
  Label,
  Spacer,
  Text,
  accessibilityLabel,
  font,
  foregroundStyle,
  padding,
  tint,
  Section,
  buttonStyle,
  glassEffect,
  frame,
  GlassEffectContainer,
} from 'sykamore-ui/ios';
import type {AttachmentKindCount} from '../utils/attachment-counts';
import type {AttachmentKind} from '@sykamore/types';
import type {SFSymbol} from 'sf-symbols-typescript';

interface AttachmentKindTile {
  kind: AttachmentKind;
  label: string;
  count: number;
  onPress?: () => void;
  systemImage: IconName;
}

type AttachmentKindKey = AttachmentKindTile['kind'];

interface AttachmentFilterChip {
  label: string;
  onClear: () => void;
  accessibilityLabel?: string;
}

interface AttachmentsOverviewProps {
  counts: AttachmentKindCount;
  onTilePress?: Partial<Record<AttachmentKindKey, () => void>>;
  filterChip?: AttachmentFilterChip;
}

export function AttachmentsOverview({
  counts,
  onTilePress,
  filterChip,
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
        systemImage: AppIcons.files.image,
      },
      {
        kind: 'document' as const,
        label: 'Documents',
        count: counts.document,
        onPress: onTilePress?.document,
        systemImage: AppIcons.files.document,
      },
      {
        kind: 'archive' as const,
        label: 'Archives',
        count: counts.archive,
        onPress: onTilePress?.archive,
        systemImage: AppIcons.files.archive,
      },
      {
        kind: 'other' as const,
        label: 'Other',
        count: counts.other,
        onPress: onTilePress?.other,
        systemImage: AppIcons.files.others,
      },
    ],
    [counts, onTilePress],
  );

  if (Platform.OS === 'ios') {
    const filterHeader = filterChip ? (
      <GlassEffectContainer
        modifiers={[
          padding({vertical: ds.spacing.lg, horizontal: ds.spacing.lg}),
          frame({
            alignment: 'center',
            minWidth: 360,
            maxHeight: 50,
            idealHeight: 50,
          }),
          glassEffect({
            glass: {
              variant: 'regular',
              interactive: true,
              tint: theme.accentBlue,
            },
            shape: 'roundedRectangle',
            cornerRadius: ds.borderRadius.full,
          }),
          foregroundStyle(Palette.lightBlue),
        ]}
      >
        <HStack alignment="center">
          <Text>{filterChip.label}</Text>
          <Spacer />
          <Button
            onPress={filterChip.onClear}
            label="clear filter"
            modifiers={[
              buttonStyle('plain'),
              font({
                size: ds.typography.ios.callout.baseSize,
                weight: 'medium',
              }),
              accessibilityLabel(
                filterChip.accessibilityLabel ?? 'Clear filter',
              ),
            ]}
          />
        </HStack>
      </GlassEffectContainer>
    ) : undefined;

    return (
      <Host style={{flex: 1}} matchContents>
        <IOSList listStyle="automatic" scrollEnabled refreshEnabled moveEnabled>
          <Section header={filterHeader} title="All Attachments">
            {tiles.map((tile) => {
              const countText =
                tile.count > 0
                  ? `${tile.count} ${tile.count === 1 ? 'file' : 'files'}`
                  : 'none';

              return (
                <Button onPress={tile.onPress} key={tile.kind}>
                  <HStack key={tile.kind}>
                    <Label
                      modifiers={[tint(theme.text)]}
                      title={tile.label}
                      systemImage={tile.systemImage as SFSymbol}
                    />
                    <Spacer />

                    <Text
                      monospaced
                      modifiers={[
                        font({
                          size: ds.typography.ios.caption.baseSize,
                        }),
                        foregroundStyle(theme.muted),
                        padding({horizontal: ds.spacing.md}),
                      ]}
                    >
                      {countText}
                    </Text>

                    <Icon
                      name={AppIcons.ui.chevronRight}
                      noContainer
                      useSwiftUI
                      colorToken="muted"
                    />
                  </HStack>
                </Button>
              );
            })}
          </Section>
        </IOSList>
      </Host>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {filterChip && (
        <View style={styles.filterContainer}>
          <Chip
            onPress={filterChip.onClear}
            onClose={filterChip.onClear}
            accessibilityLabel={filterChip.accessibilityLabel ?? 'Clear filter'}
            style={styles.filterChip}
            mode="flat"
            elevation={2}
          >
            {filterChip.label}
          </Chip>
        </View>
      )}
      {tiles.map((tile, index) => (
        <View key={tile.kind}>
          <List.Item
            title={<ThemedText variant="body">{tile.label}</ThemedText>}
            description={
              tile.count > 0
                ? `${tile.count} ${tile.count === 1 ? 'file' : 'files'}`
                : undefined
            }
            left={() => (
              <Icon
                name={AppIcons.tabs.vault}
                size="xxl"
                colorToken="accentBlue"
              />
            )}
            onPress={tile.onPress}
            descriptionStyle={styles.description}
          />
          {index < tiles.length - 1 && <Divider style={styles.divider} />}
        </View>
      ))}
    </ScrollView>
  );
}

const useStyles = makeStyleFactory(
  (ds: DSShape, theme: ThemeShape) =>
    StyleSheet.create({
      container: {
        flex: 1,
        paddingHorizontal: ds.spacing.lg,
      },
      description: {
        color: theme.muted,
      },
      filterContainer: {
        paddingVertical: ds.spacing.lg,
      },
      filterChip: {
        alignSelf: 'flex-start',
        borderRadius: ds.borderRadius.full,
      },
      divider: {
        marginLeft: ds.spacing.xxl + ds.spacing.xl,
        height: 1,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
