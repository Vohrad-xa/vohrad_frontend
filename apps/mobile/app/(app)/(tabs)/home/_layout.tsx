import {View, Platform} from 'react-native';
import {Stack} from 'expo-router';
import {HeaderButton} from '@/components/ui';
import {useTheme, useSidebar} from '@/providers';
import {AppIcons} from '@/utils';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function HomeLayout() {
  const {theme} = useTheme();
  const {toggleSideMenu} = useSidebar();

  return (
    <View style={{flex: 1, backgroundColor: theme.background}}>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            headerTitle: 'Home',
            headerLeft: () => (
              <HeaderButton
                icon={AppIcons.navigation.menu}
                accessibilityLabel="Open menu"
                onPress={toggleSideMenu}
                iconSize="xxl"
              />
            ),
            headerTitleAlign: 'center' as const,
            headerTransparent: Platform.OS === 'ios',
            headerShadowVisible: false,
            headerStyle: {
              backgroundColor:
                Platform.OS === 'android' ? theme.navigationBar : undefined,
            },
          }}
        />
      </Stack>
    </View>
  );
}
