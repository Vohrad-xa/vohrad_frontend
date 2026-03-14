import {Stack} from 'expo-router';
import {useTheme} from '@/providers';
import {baseStackOptions, sectionTitleStyle} from '@/utils/navigation';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function HomeLayout() {
  const {theme} = useTheme();
  const screenOptions = baseStackOptions(theme);
  const titleStyle = sectionTitleStyle(theme);

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen
        name="index"
        options={{
          headerTitle: 'Dashboard',
          headerTitleStyle: titleStyle,
        }}
      />
      <Stack.Screen
        name="scan"
        options={{
          presentation: 'formSheet',
        }}
      />
    </Stack>
  );
}
