import React, {forwardRef} from 'react';
import {
  View,
  StyleSheet,
  type TextInput,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import type {TokenName} from '@/constants/colors';
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

    const iconOffset = ds.spacing.md + ds.iconSize.sm + ds.spacing.xs;
    const inputPaddingLeft = showIcon ? iconOffset : undefined;

    return (
      <View style={[styles.wrapper, containerStyle]}>
        <Input
          ref={ref}
          style={[showIcon && {paddingLeft: inputPaddingLeft}, style]}
          placeholderTextColor={placeholderTextColor ?? theme.iosPlaceholder}
          returnKeyType={returnKeyType}
          autoCorrect={autoCorrect ?? false}
          autoCapitalize={autoCapitalize ?? 'none'}
          {...rest}
        />

        {showIcon ? (
          <View
            style={[
              styles.iconSlot,
              {
                left: ds.spacing.md,
                transform: [{translateY: -ds.iconSize.sm / 2}],
                pointerEvents: 'none',
              },
            ]}
          >
            <Icon name={iconName} size={ds.iconSize.sm} color={iconColor} />
          </View>
        ) : null}
      </View>
    );
  },
);

SearchBar.displayName = 'SearchBar';

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
  },
  iconSlot: {
    position: 'absolute',
    top: '50%',
    justifyContent: 'center',
  },
});
