import React, {forwardRef} from 'react';
import {View, StyleSheet, type TextInput} from 'react-native';
import type {ThemeColorTokenName} from '@/constants/colors';
import {type DSShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import type {IconProps, ContainerStyleProps} from '@/types';
import {Icon, AppIcons} from '@/utils';
import {makeStyleFactory} from '@/utils/style-factory';
import {Input, type InputProps} from './input';

export interface SearchBarProps
  extends InputProps,
    Pick<IconProps, 'icon'>,
    Pick<ContainerStyleProps, 'containerStyle'> {
  showIcon?: boolean;
  iconColorToken?: ThemeColorTokenName;
}

export const SearchBar = forwardRef<TextInput, SearchBarProps>(
  (
    {
      containerStyle,
      style,
      icon: iconName = AppIcons.inventory.search,
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

const createStyles = makeStyleFactory(
  (ds: DSShape) => {
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
  },
  (ds) => ds.version.toString(),
);
