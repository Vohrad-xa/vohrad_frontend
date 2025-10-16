import {View, StyleSheet} from 'react-native';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils/style-factory';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import type {BaseViewProps} from '@/types';

interface DividerProps extends Pick<BaseViewProps, 'style'> {}

export function Divider({style}: DividerProps) {
  const {theme, ds} = useTheme();
  const styles = createStyles(theme, ds);

  return <View style={[styles.divider, style]} />;
}

const createStyles = makeStyleFactory(
  (theme: ThemeShape, ds: DSShape) =>
    StyleSheet.create({
      divider: {
        height: 0.3,
        backgroundColor: theme.divider,
        marginVertical: ds.spacing.md,
      },
    }),
  (theme, ds) => themeKey(theme, ds),
);
