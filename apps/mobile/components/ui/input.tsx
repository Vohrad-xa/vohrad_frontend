import React, {forwardRef} from 'react';
import {
  View,
  TextInput,
  type TextInputProps,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';

import type {TokenName} from '@/constants';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {Icon, makeStyleFactory} from '@/utils';
import {GlassCard} from '../cards/glass-card';

export type InputStatus = 'none' | 'error' | 'success';

export type InputProps = TextInputProps & {
  status?: InputStatus;
  onStatusIconPress?: () => void;
  rightIconName?: string;
  onRightIconPress?: () => void;
  disableGlass?: boolean;
};

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      style,
      placeholderTextColor,
      status = 'none',
      onStatusIconPress,
      rightIconName,
      onRightIconPress,
      disableGlass = false,
      ...props
    },
    ref,
  ) => {
    const {theme, ds} = useTheme();
    const styles = createStyles(ds, theme);

    const iconSize = ds.iconSize.md;

    const hasStatus = status === 'error' || status === 'success';
    const hasCustomRight = !hasStatus && !!rightIconName;
    const showRightIcon = hasStatus || hasCustomRight;

    const statusIcon =
      status === 'error'
        ? {name: 'warning-outline', color: theme.destructive}
        : status === 'success'
          ? {name: 'checkmark-outline', color: theme.accentGreen}
          : null;

    const inputContent = (
      <>
        <TextInput
          ref={ref}
          style={[
            styles.input,
            styles.baseInput,
            showRightIcon && styles.inputWithRightIcon,
            style,
          ]}
          placeholderTextColor={placeholderTextColor ?? theme.iosPlaceholder}
          {...props}
        />

        {showRightIcon && (
          <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
            <View style={styles.rightIconContainer}>
              {statusIcon ? (
                <TouchableOpacity
                  activeOpacity={onStatusIconPress ? 0.6 : 1}
                  onPress={onStatusIconPress}
                  hitSlop={{top: 6, bottom: 6, left: 6, right: 6}}
                >
                  <Icon
                    name={statusIcon.name}
                    size={iconSize}
                    colorToken={statusIcon.color as TokenName}
                  />
                </TouchableOpacity>
              ) : rightIconName ? (
                <TouchableOpacity
                  activeOpacity={onRightIconPress ? 0.6 : 1}
                  onPress={onRightIconPress}
                  hitSlop={{top: 6, bottom: 6, left: 6, right: 6}}
                >
                  <Icon
                    name={rightIconName}
                    size={iconSize}
                    colorToken="icon"
                  />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        )}
      </>
    );

    if (disableGlass) {
      return (
        <View style={styles.container}>
          <View style={styles.glassContainer}>{inputContent}</View>
        </View>
      );
    }

    return (
      <GlassCard
        style={styles.container}
        contentStyle={styles.glassContainer}
        isInteractive
      >
        {inputContent}
      </GlassCard>
    );
  },
);

Input.displayName = 'Input';

const createStyles = makeStyleFactory(
  (ds: DSShape, theme: ThemeShape) => {
    const rightPad = ds.spacing.xxxl;
    const inputMinHeight = 36;

    return StyleSheet.create({
      container: {
        width: '100%',
      },
      glassContainer: {
        position: 'relative',
      },
      input: {
        flex: 1,
        borderWidth: 0,
        textAlign: 'left',
      },
      baseInput: {
        backgroundColor: 'transparent',
        color: theme.text,
        borderRadius: ds.components.input.borderRadius,
        paddingVertical: ds.spacing.md,
        paddingHorizontal: ds.spacing.md,
        fontSize: ds.typography.body.fontSize,
        fontWeight: ds.typography.body.fontWeight,
        minHeight: inputMinHeight,
        ...Platform.select({
          android: {
            textAlignVertical: 'center' as const,
            includeFontPadding: false,
          },
        }),
      },
      inputWithRightIcon: {
        paddingRight: rightPad,
      },
      rightIconContainer: {
        position: 'absolute',
        right: ds.spacing.md,
        top: 0,
        bottom: 0,
        minWidth: ds.components.tapTarget.minSize,
        justifyContent: 'center',
        alignItems: 'flex-end',
      },
    });
  },
  (ds, theme) => themeKey(theme, ds),
);
