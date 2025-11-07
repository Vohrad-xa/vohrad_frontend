import React from 'react';
import {StyleSheet, View, type ViewStyle} from 'react-native';
import {type DSShape, themeKey, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils/style-factory';
import {Divider} from '../ui/divider';
import {Icon} from '@/utils/icons';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  withDivider?: boolean;
  icon?: React.ComponentProps<typeof Icon>['name'];
  iconSize?: React.ComponentProps<typeof Icon>['size'];
  iconColorToken?: React.ComponentProps<typeof Icon>['colorToken'];
  hideChevron?: boolean;
}

export function Card({
  children,
  style,
  withDivider,
  icon,
  iconSize = 'lg',
  iconColorToken = 'muted',
  hideChevron = false,
}: CardProps) {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);

  if (withDivider) {
    const childArray = React.Children.toArray(children);
    return (
      <View style={[styles.card, style]}>
        {icon && (
          <View style={styles.iconContainer}>
            <Icon name={icon} size={iconSize} colorToken={iconColorToken} />
          </View>
        )}
        <View style={styles.childContainer}>
          {childArray.map((child, index) => (
            <View key={index}>
              <View>
                {React.isValidElement(child) &&
                child.props &&
                (child.props as any).icon ? (
                  <View style={styles.rowWithIcon}>
                    <View style={styles.iconWrapper}>
                      <Icon
                        name={(child.props as any).icon}
                        size="md"
                        color={theme.secondary}
                      />
                    </View>
                    <View style={styles.content}>{child}</View>
                    {!hideChevron &&
                      !(
                        React.isValidElement(child) &&
                        child.props &&
                        (child.props as any).hideChevron
                      ) && (
                        <Icon
                          name="chevron-forward-outline"
                          colorToken="muted"
                          style={styles.chevron}
                        />
                      )}
                  </View>
                ) : (
                  child
                )}
              </View>
              {index < childArray.length - 1 && (
                <View style={styles.dividerWrapper}>
                  <View
                    style={
                      icon ||
                      (React.isValidElement(child) &&
                        child.props &&
                        (child.props as any).icon)
                        ? styles.dividerWithIconOffset
                        : undefined
                    }
                  >
                    <Divider />
                  </View>
                </View>
              )}
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.card, style]}>
      {icon && (
        <View style={styles.iconContainer}>
          <Icon name={icon} size={iconSize} colorToken={iconColorToken} />
        </View>
      )}
      <View style={styles.childContainer}>{children}</View>
    </View>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape, theme: ThemeShape) =>
    StyleSheet.create({
      card: {
        backgroundColor: theme.input,
        borderRadius: ds.components.card.borderRadius,
      },
      iconContainer: {
        alignItems: 'center',
        paddingBottom: ds.spacing.md,
      },
      childContainer: {
        paddingHorizontal: ds.spacing.xl,
        paddingVertical: ds.spacing.lg,
      },
      rowWithIcon: {
        flexDirection: 'row',
        alignItems: 'center',
      },
      iconWrapper: {
        marginRight: ds.spacing.lg,
        backgroundColor: theme.card,
        padding: 6,
        borderRadius: ds.spacing.md,
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
        paddingLeft: ds.spacing.xxxl + 2,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
