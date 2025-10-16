import {View, StyleSheet} from 'react-native';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import type {BaseViewProps} from '@/types';
import {makeStyleFactory} from '@/utils/style-factory';

export function Divider({style}: Pick<BaseViewProps, 'style'>) {
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
