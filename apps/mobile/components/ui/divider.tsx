import {View, StyleSheet, Platform} from 'react-native';
import {type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import type {BaseViewProps} from '@/types';
import {makeStyleFactory} from '@/utils/style-factory';

export function Divider({style}: Pick<BaseViewProps, 'style'>) {
  const {theme} = useTheme();
  const styles = createStyles(theme);

  return <View style={[styles.divider, style]} />;
}

const createStyles = makeStyleFactory(
  (theme: ThemeShape) =>
    StyleSheet.create({
      divider: {
        height: Platform.OS === 'android' ? 1 : StyleSheet.hairlineWidth,
        backgroundColor: theme.divider,
        marginVertical: 0,
      },
    }),
  (theme) => `${theme.version}`,
);
