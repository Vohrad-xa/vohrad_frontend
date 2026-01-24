import React from 'react';
import {StyleSheet} from 'react-native';
import RNSlider, {type SliderProps} from '@react-native-community/slider';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils/style-factory';

export function Slider(props: SliderProps) {
  const {theme, ds} = useTheme();
  const styles = createStyles(ds, theme);

  return <RNSlider style={styles.slider} {...props} />;
}

const createStyles = makeStyleFactory(
  (_ds: DSShape, _theme: ThemeShape) =>
    StyleSheet.create({
      slider: {
        height: 30,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
