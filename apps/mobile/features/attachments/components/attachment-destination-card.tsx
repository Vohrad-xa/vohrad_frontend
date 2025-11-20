import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Link} from 'expo-router';
import {Card} from '@/components/cards/card';
import {ThemedText} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils';

type AttachmentDestinationCardProps = {
  targetName?: string;
  targetType?: string;
};

export function AttachmentDestinationCard({
  targetName,
  targetType,
}: AttachmentDestinationCardProps) {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);

  return (
    <Link href="/(modals)/attachments">
      <Link.Trigger>
        <View>
          <Card>
            <Card.Row
              icon="folder-outline"
              accessibilityLabel="Select destination for attachment"
            >
              <ThemedText variant="label">
                {targetName ?? 'Select destination'}
              </ThemedText>
              {targetType && (
                <ThemedText variant="caption">{targetType}</ThemedText>
              )}
            </Card.Row>
          </Card>
          <ThemedText variant="caption" style={styles.helperText}>
            Attachments will be associated with the resource you select. Choose
            where to store your files.
          </ThemedText>
        </View>
      </Link.Trigger>
      <Link.Preview />
    </Link>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape, _theme: ThemeShape) =>
    StyleSheet.create({
      helperText: {
        marginTop: ds.spacing.sm,
        marginHorizontal: ds.spacing.lg,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
