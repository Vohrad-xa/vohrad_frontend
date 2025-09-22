import {Platform, TouchableOpacity} from 'react-native';
import {useSidebar, useTheme} from '@/providers';
import {Icon, AppIcons} from '@/utils';

export function MenuButton() {
  const {theme, ds} = useTheme();
  const {toggleSideMenu} = useSidebar();
  const baseSize = Platform.select({ios: 36, default: ds.components.tapTarget.minSize});

  return (
    <TouchableOpacity
      style={{
        minWidth: baseSize,
        minHeight: baseSize,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: baseSize ? baseSize / 2 : ds.borderRadius.lg,
        alignSelf: 'center',
      }}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel="Open menu"
      onPress={toggleSideMenu}>
      <Icon name={AppIcons.navigation.menu} size={ds.iconSize.xl} color={theme.muted} />
    </TouchableOpacity>
  );
}
