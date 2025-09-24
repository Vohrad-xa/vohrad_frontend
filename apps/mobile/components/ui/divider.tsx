import {View, StyleSheet} from 'react-native';
import type {DesignSystem} from '@/constants/typography';
import {useTheme} from '@/providers';
type ThemeType = ReturnType<typeof useTheme>['theme'];

interface DividerProps {
  style?: object;
}

export function Divider({style}: DividerProps) {
  const {theme, ds} = useTheme();
  const styles = createStyles(theme, ds);

  return <View style={[styles.divider, style]} />;
}

const createStyles = (theme: ThemeType, ds: typeof DesignSystem) =>
  StyleSheet.create({
    divider: {
      height: 0.3,
      backgroundColor: theme.divider,
      marginVertical: ds.spacing.md,
    },
  });
