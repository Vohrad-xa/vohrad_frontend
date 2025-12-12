import {View, Platform, StyleSheet} from 'react-native';
import {Stack} from 'expo-router';
import {HeaderButton} from '@/components/ui';
import {useTheme, useSidebar} from '@/providers';
import {AppIcons, makeStyleFactory} from '@/utils';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function HomeLayout() {
  const {theme, ds} = useTheme();
  const {toggleSideMenu} = useSidebar();
  const styles = createStyles(ds, theme);

  return (
    <View style={styles.container}>
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

const createStyles = makeStyleFactory(
  (_ds: DSShape, theme: ThemeShape) =>
    StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: theme.background,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
