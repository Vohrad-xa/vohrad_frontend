import {View, Platform, StyleSheet} from 'react-native';
import {Stack} from 'expo-router';
import {HeaderButton} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme, useSidebar} from '@/providers';
import {makeStyleFactory} from '@/utils';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function HomeLayout() {
  const {theme, ds} = useTheme();
  const {toggleSideMenu} = useSidebar();
  const styles = createStyles(ds, theme);

  return (
    <View style={styles.container}>
      <Stack
        screenOptions={{
          headerLargeTitle: true,
          headerTitleAlign: 'left',
          headerTransparent: Platform.OS === 'ios',
          headerShadowVisible: false,
          headerTitleStyle: {
            fontWeight: ds.fontWeight.bold,
            color: Platform.OS !== 'ios' ? theme.headerAndroid : undefined,
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            headerTitle: 'Dashboard',
            headerLeft: () => (
              <HeaderButton
                variant="menu"
                accessibilityLabel="Open menu"
                onPress={toggleSideMenu}
              />
            ),
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
