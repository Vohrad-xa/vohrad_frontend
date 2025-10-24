import {Stack} from 'expo-router';
import {useTheme, useSidebar} from '@/providers';
import {getTabStackOptions} from '@/utils';

export default function LocationsLayout() {
  const {theme} = useTheme();
  const {toggleSideMenu} = useSidebar();

  return <Stack screenOptions={getTabStackOptions(theme, toggleSideMenu)} />;
}
