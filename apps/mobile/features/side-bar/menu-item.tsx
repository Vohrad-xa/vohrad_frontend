import {TouchableOpacity, Text, StyleSheet} from 'react-native';
import type {DesignSystem} from '@/constants/typography';
import {useTheme} from '@/providers';
import type {MenuItemProps} from '@/types/ui';
import {Icon} from '@/utils';
type ThemeType = ReturnType<typeof useTheme>['theme'];

export function MenuItem({icon, label, onPress, isDestructive}: MenuItemProps) {
  const {theme, ds} = useTheme();
  const styles = createStyles(theme, ds);

  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Icon name={icon} size={ds.iconSize.lg} color={isDestructive ? theme.destructive : theme.muted} />
      <Text style={styles.menuItemText}>{label}</Text>
    </TouchableOpacity>
  );
}

const createStyles = (theme: ThemeType, ds: typeof DesignSystem) =>
  StyleSheet.create({
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 0,
      minHeight: ds.components.listItem.minHeight,
      paddingVertical: ds.components.listItem.paddingVertical,
      borderRadius: ds.borderRadius.sm,
      marginBottom: ds.spacing.xs,
    },
    menuItemText: {
      color: theme.text,
      ...ds.typography.body,
      fontWeight: ds.fontWeight.medium,
      marginLeft: ds.spacing.md,
    },
  });
