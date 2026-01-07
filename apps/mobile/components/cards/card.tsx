import React from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import {isLiquidGlassAvailable, GlassView} from 'expo-glass-effect';
import {type DSShape, themeKey, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {AppIcons, Icon} from '@/utils/icons';
import {makeStyleFactory} from '@/utils/style-factory';
import {Divider} from 'react-native-paper';

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
          {isLiquidGlassAvailable() ? (
            <GlassView
              style={styles.iconWrapper}
              glassEffectStyle="regular"
              isInteractive={false}
            >
              <Icon name={icon} size="lg" />
            </GlassView>
          ) : (
            <Icon name={icon} size="lg" />
          )}
        </View>
      )}
      <View style={styles.content}>{children}</View>
      {!hideChevron && (
        <Icon
          name={AppIcons.ui.chevronRight}
          colorToken="muted"
          size={Platform.OS === 'ios' ? 14 : 'sm'}
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
    const iconColumnWidth = ds.spacing.xl * 2;

    return StyleSheet.create({
      content: {
        flex: 1,
      },
      card: {
        backgroundColor: theme.input,
        borderRadius: ds.components.card.borderRadius,
      },
      childContainer: {
        paddingHorizontal: ds.spacing.lg,
        paddingVertical: ds.spacing.md,
      },
      rowWithIcon: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 0,
      },
      iconWrapper: {
        width: 32,
        height: 32,
        marginRight: ds.spacing.sm,
        borderRadius: ds.spacing.md,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 0,
      },
      chevron: {
        marginLeft: ds.spacing.md,
        marginRight: -ds.spacing.xxs,
      },
      dividerWrapper: {
        paddingVertical: ds.spacing.md,
      },
      dividerWithIconOffset: {
        marginLeft: iconColumnWidth,
      },
    });
  },
  (ds, theme) => themeKey(theme, ds),
);
