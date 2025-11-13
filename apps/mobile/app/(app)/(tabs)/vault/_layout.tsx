import {useCallback} from 'react';
import {Platform, View, StyleSheet} from 'react-native';
import {Stack} from 'expo-router';
import {HeaderButton} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {AttachmentProvider} from '@/features/attachments/providers/attachment-provider';
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
          headerLargeTitleShadowVisible: true,
          headerTransparent: Platform.OS === 'ios',
          contentStyle: {
            backgroundColor:
              Platform.OS === 'web' ? theme.webbackground : theme.background,
          },
          headerStyle: {
            backgroundColor:
              Platform.OS === 'android' ? theme.navigationBar : undefined,
          },
          headerTitleAlign: 'center',
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            headerTitle: 'Vault',
            headerLeft: () => (
              <HeaderButton
                icon={AppIcons.navigation.menu}
                accessibilityLabel="Open menu"
                onPress={toggleSideMenu}
                iconSize="xxl"
              />
            ),
            headerSearchBarOptions: {
              headerIconColor: theme.text,
              placement: 'stacked',
              shouldShowHintSearchIcon: true,
              allowToolbarIntegration: false,
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
          }}
        />
      </Stack>
    </View>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape, theme: ThemeShape) =>
    StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor:
          Platform.OS === 'web' ? theme.webbackground : theme.background,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);

export default function VaultLayout() {
  return (
    <SearchProvider>
      <AttachmentProvider>
        <VaultStack />
      </AttachmentProvider>
    </SearchProvider>
  );
}
