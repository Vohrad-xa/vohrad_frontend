import React, {forwardRef} from 'react';
import {
  View,
  StyleSheet,
  type TextInput,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import type {TokenName} from '@/constants/colors';
import type {DesignSystem} from '@/constants/typography';
import {useTheme} from '@/providers';
import {Icon, AppIcons, type IconName} from '@/utils';
import {Input, type InputProps} from './input';

export interface SearchBarProps extends InputProps {
  containerStyle?: StyleProp<ViewStyle>;
  iconName?: IconName;
  iconColorToken?: TokenName;
  showIcon?: boolean;
}

export const SearchBar = forwardRef<TextInput, SearchBarProps>(
  (
    {
      containerStyle,
      style,
      iconName = AppIcons.inventory.search,
      iconColorToken = 'muted',
      showIcon = true,
      placeholderTextColor,
      returnKeyType = 'search',
      autoCorrect,
      autoCapitalize,
      ...rest
    },
    ref,
  ) => {
    const {theme, ds} = useTheme();
    const iconColor = theme[iconColorToken] ?? theme.muted;
    const styles = createStyles(ds);

    return (
      <View style={[styles.wrapper, containerStyle]}>
        <Input
          ref={ref}
          style={[styles.compactInput, showIcon && styles.inputWithIcon, style]}
          placeholderTextColor={placeholderTextColor ?? theme.iosPlaceholder}
          returnKeyType={returnKeyType}
          autoCorrect={autoCorrect ?? false}
          autoCapitalize={autoCapitalize ?? 'none'}
          {...rest}
        />

        {showIcon ? (
          <View style={[styles.iconSlot, styles.iconPosition]}>
            <Icon name={iconName} size={ds.iconSize.sm} color={iconColor} />
          </View>
        ) : null}
      </View>
    );
  },
);

SearchBar.displayName = 'SearchBar';

const createStyles = (ds: typeof DesignSystem) => {
  const iconOffset = ds.spacing.md + ds.iconSize.sm + ds.spacing.xs;

  return StyleSheet.create({
    wrapper: {
      flex: 1,
      position: 'relative',
      justifyContent: 'center',
    },
    iconSlot: {
      position: 'absolute',
      top: '50%',
      justifyContent: 'center',
      pointerEvents: 'none',
    },
    compactInput: {
      paddingVertical: 8,
      minHeight: 32,
    },
    inputWithIcon: {
      paddingLeft: iconOffset,
    },
    iconPosition: {
      left: ds.spacing.md,
      transform: [{translateY: -ds.iconSize.sm / 2}],
    },
  });
};
