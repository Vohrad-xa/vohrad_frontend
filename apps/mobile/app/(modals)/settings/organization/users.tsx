import React, {useLayoutEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {useNavigation} from 'expo-router';
import {HeaderButton, ModalFlatList, ThemedView} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useSearch} from '@/features/dashboard';
import {UsersFilterMenu, UsersList} from '@/features/settings/organization';
import {useTheme} from '@/providers';
import {AppIcons, makeStyleFactory} from '@/utils';

export default function UsersScreen() {
  const {ds, theme} = useTheme();
  const navigation = useNavigation();
  const styles = createStyles(ds, theme);
  const {searchQuery} = useSearch();
  const [filterControl, setFilterControl] = useState<React.ReactNode>(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerButtonGroup}>
          {filterControl}
          <HeaderButton
            icon={AppIcons.actions.add}
            onPress={() => {
              // TODO: Add user logic
            }}
            iconColorToken="text"
            accessibilityLabel="Add user"
            iconSize="xl"
          />
        </View>
      ),
    });
  }, [filterControl, navigation, styles.headerButtonGroup]);

  return (
    <UsersFilterMenu
      searchQuery={searchQuery}
      onFilterControlChange={setFilterControl}
    >
      {({users, refresh, hasNext, onEndReached}) => {
        const handleUserPress = (_userId: string) => {
          // TODO: Navigate to user detail when ready
        };

        const {listData, renderItem} = UsersList({
          users,
          onUserPress: handleUserPress,
        });

        return (
          <ThemedView style={styles.container}>
            <ModalFlatList
              data={listData}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              onRefresh={refresh}
              onEndReached={hasNext ? onEndReached : undefined}
              onEndReachedThreshold={0.4}
            />
          </ThemedView>
        );
      }}
    </UsersFilterMenu>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape, _theme: ThemeShape) =>
    StyleSheet.create({
      container: {
        flex: 1,
      },
      headerButtonGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: ds.spacing.xs,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
