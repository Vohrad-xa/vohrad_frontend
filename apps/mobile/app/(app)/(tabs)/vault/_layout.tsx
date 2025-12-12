import {useCallback} from 'react';
import {Platform, View, StyleSheet} from 'react-native';
import {Stack} from 'expo-router';
import {HeaderButton} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {VaultOptionsMenu} from '@/features/attachments';
import {SearchProvider, useSearch} from '@/features/dashboard';
import {useTheme, useSidebar} from '@/providers';
import {AppIcons, makeStyleFactory} from '@/utils';

interface SearchChangeEvent {
  nativeEvent: {
    text: string;
  };
}

function VaultStack() {
  const {theme, ds} = useTheme();
  const {toggleSideMenu} = useSidebar();
  const {setSearchQuery} = useSearch();
  const styles = createStyles(ds, theme);

  const handleSearchChange = useCallback(
    (event: SearchChangeEvent) => {
      const text = event.nativeEvent.text;
      setSearchQuery(text);
    },
    [setSearchQuery],
  );

  return (
    <View style={styles.container}>
      <Stack
        screenOptions={{
          headerShown: true,
          headerShadowVisible: false,
          headerLargeTitle: true,
          headerBackButtonDisplayMode: 'minimal',
          headerTransparent: Platform.OS === 'ios',
          headerTitleAlign: 'left',
          headerTitleStyle: {
            fontWeight: ds.fontWeight.bold,
            color: Platform.OS !== 'ios' ? theme.headerAndroid : undefined,
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            headerTitle: 'Vault',
            headerLeft: () => (
              <HeaderButton
                iconSize={Platform.OS === 'ios' ? 'xl' : 'xxl'}
                icon={AppIcons.navigation.menu}
                accessibilityLabel="Open menu"
                onPress={toggleSideMenu}
              />
            ),
            headerSearchBarOptions: {
              headerIconColor:
                Platform.OS === 'android' ? theme.headerAndroid : undefined,
              placement: 'stacked',
              shouldShowHintSearchIcon: true,
              hideWhenScrolling: false,
              placeholder: 'Search...',
              onChangeText: handleSearchChange,
            },
          }}
        />
        <Stack.Screen
          name="add"
          options={{
            headerTitle: 'Add Attachment',
            headerLargeTitle: false,
          }}
        />
        <Stack.Screen
          name="images"
          options={{
            headerTitle: 'Library',
          }}
        />
        <Stack.Screen
          name="documents"
          options={{
            headerTitle: 'Documents',
            headerRight: () => <VaultOptionsMenu />,
          }}
        />
        <Stack.Screen
          name="archives"
          options={{
            headerTitle: 'Archives',
            headerRight: () => <VaultOptionsMenu />,
          }}
        />
        <Stack.Screen
          name="other"
          options={{
            headerTitle: 'Other Attachments',
            headerRight: () => <VaultOptionsMenu />,
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

export default function VaultLayout() {
  return (
    <SearchProvider>
      <VaultStack />
    </SearchProvider>
  );
}
