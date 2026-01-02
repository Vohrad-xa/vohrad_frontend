import React, {forwardRef} from 'react';
import {
  View,
  TextInput,
  type TextInputProps,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {Icon, makeStyleFactory} from '@/utils';
import type {IconName} from '@/utils/icons';
import {GlassCard} from '../cards/glass-card';

export type InputProps = TextInputProps & {
  rightIconName?: IconName;
  onRightIconPress?: () => void;
  disableGlass?: boolean;
};

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      style,
      placeholderTextColor,
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

    const inputContent = (
      <>
        <TextInput
          ref={ref}
          style={[
            styles.input,
            styles.baseInput,
            rightIconName && styles.inputWithRightIcon,
            style,
          ]}
          placeholderTextColor={placeholderTextColor ?? theme.card}
          {...props}
        />

        {rightIconName && (
          <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
            <View style={styles.rightIconContainer}>
              <TouchableOpacity
                activeOpacity={onRightIconPress ? 0.6 : 1}
                onPress={onRightIconPress}
                hitSlop={{top: 6, bottom: 6, left: 6, right: 6}}
              >
                <Icon name={rightIconName} size={iconSize} colorToken="icon" />
              </TouchableOpacity>
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
