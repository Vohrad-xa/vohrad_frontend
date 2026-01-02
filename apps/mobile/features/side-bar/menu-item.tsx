import {TouchableOpacity, StyleSheet} from 'react-native';
import {ThemedText} from '@/components/ui/themed-text';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import type {MenuItemProps} from '@/types/ui';
import {Icon} from '@/utils';
import {makeStyleFactory} from '@/utils/style-factory';

export function MenuItem({icon, label, onPress, isDestructive}: MenuItemProps) {
  const {theme, ds} = useTheme();
  const styles = createStyles(theme, ds);

  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Icon
        size="lg"
        name={icon}
        color={isDestructive ? theme.destructive : theme.muted}
      />
      <ThemedText variant="body" style={styles.menuItemText}>
        {label}
      </ThemedText>
    </TouchableOpacity>
  );
}

const createStyles = makeStyleFactory(
  (theme: ThemeShape, ds: DSShape) =>
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
        fontWeight: ds.fontWeight.medium,
        marginLeft: ds.spacing.md,
      },
    }),
  (theme, ds) => themeKey(theme, ds),
);
