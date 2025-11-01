import {Stack} from 'expo-router';
import {useTheme, useSidebar} from '@/providers';
import {getTabStackOptions} from '@/utils/navigation-config';

export default function EventsLayout() {
  const {theme, scheme} = useTheme();
  const {toggleSideMenu} = useSidebar();

  return (
    <Stack screenOptions={getTabStackOptions(theme, toggleSideMenu, scheme)} />
  );
}
