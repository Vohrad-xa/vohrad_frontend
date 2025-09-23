import {View, StyleSheet} from 'react-native';
import {useTheme} from '@/providers';
import type {DesignSystem} from '@/constants/typography';
import type {Tokens} from '@/constants/colors';

interface DividerProps {
  style?: object;
}

export function Divider({style}: DividerProps) {
  const {theme, ds} = useTheme();
  const styles = createStyles(theme, ds);

  return <View style={[styles.divider, style]} />;
}

const createStyles = (theme: typeof Tokens.light | typeof Tokens.dark, ds: typeof DesignSystem) =>
  StyleSheet.create({
    divider: {
      height: 0.3,
      backgroundColor: theme.divider,
      marginVertical: ds.spacing.md,
    },
  });
