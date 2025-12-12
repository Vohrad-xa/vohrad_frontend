import {View, Platform} from 'react-native';
import {Stack} from 'expo-router';
import {HeaderButton} from '@/components/ui';
import {useTheme, useSidebar} from '@/providers';
import {AppIcons} from '@/utils';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function HomeLayout() {
  const {theme, ds} = useTheme();
  const {toggleSideMenu} = useSidebar();

  return (
    <View style={{flex: 1}}>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            headerLargeTitle: true,
            headerTitle: 'Dashboard',
            headerTitleAlign: 'left',
            headerLeft: () => (
              <HeaderButton
                iconSize={Platform.OS === 'ios' ? 'xl' : 'xxl'}
                icon={AppIcons.navigation.menu}
                accessibilityLabel="Open menu"
                onPress={toggleSideMenu}
              />
            ),
            headerTransparent: Platform.OS === 'ios',
            headerShadowVisible: false,
            headerTitleStyle: {
              fontWeight: ds.fontWeight.bold,
              color: Platform.OS !== 'ios' ? theme.headerAndroid : undefined,
            },
          }}
        />
      </Stack>
    </View>
  );
}
