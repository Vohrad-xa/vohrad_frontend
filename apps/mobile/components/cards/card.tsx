import React from 'react';
import {Pressable, StyleSheet, View, type ViewStyle} from 'react-native';
import {type DSShape, themeKey, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {Icon} from '@/utils/icons';
import {makeStyleFactory} from '@/utils/style-factory';
import {Divider} from '../ui/divider';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

interface CardRowProps {
  children: React.ReactNode;
  icon?: React.ComponentProps<typeof Icon>['name'];
  onPress?: () => void;
  hideChevron?: boolean;
  accessibilityLabel?: string;
}

interface CardDividerProps {
  withIconOffset?: boolean;
}

export function Card({children, style}: CardProps) {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);

  return (
    <View style={[styles.card, style]}>
      <View style={styles.childContainer}>{children}</View>
    </View>
  );
}

function CardRow({
  children,
  icon,
  onPress,
  hideChevron = false,
  accessibilityLabel,
}: CardRowProps) {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);

  const content = (
    <View style={styles.rowWithIcon}>
      {icon && (
        <View style={styles.iconWrapper}>
          <Icon name={icon} size="md" color={theme.secondary} />
        </View>
      )}
      <View style={styles.content}>{children}</View>
      {!hideChevron && (
        <Icon
          name="chevron-forward-outline"
          colorToken="muted"
          style={styles.chevron}
        />
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

function CardDivider({withIconOffset = false}: CardDividerProps) {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);

  return (
    <View style={styles.dividerWrapper}>
      <View style={withIconOffset ? styles.dividerWithIconOffset : undefined}>
        <Divider />
      </View>
    </View>
  );
}

Card.Row = CardRow;
Card.Divider = CardDivider;

const createStyles = makeStyleFactory(
  (ds: DSShape, theme: ThemeShape) => {
    const iconColumnWidth = 30 + ds.spacing.lg;

    return StyleSheet.create({
      card: {
        backgroundColor: theme.input,
        borderRadius: ds.components.card.borderRadius,
      },
      childContainer: {
        paddingHorizontal: ds.spacing.lg,
        paddingVertical: ds.spacing.lg,
      },
      rowWithIcon: {
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
      content: {
        flex: 1,
      },
      chevron: {
        marginLeft: ds.spacing.lg,
      },
      dividerWrapper: {
        paddingVertical: ds.spacing.lg,
      },
      dividerWithIconOffset: {
        marginLeft: iconColumnWidth,
      },
    });
  },
  (ds, theme) => themeKey(theme, ds),
);
