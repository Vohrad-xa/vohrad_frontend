import React from 'react';
import {StyleSheet} from 'react-native';
import {ThemedView, ModalFlatList} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useSearch} from '@/features/dashboard';
import {UsersList} from '@/features/settings/organization';
import {useSearchUsers} from '@/features/settings/organization/hooks';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils';

export default function UsersScreen() {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);
  const {searchQuery} = useSearch();
  const {users, refresh, hasNext, onEndReached} = useSearchUsers({
    searchQuery,
  });

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
}

const createStyles = makeStyleFactory(
  (_ds: DSShape, _theme: ThemeShape) =>
    StyleSheet.create({
      container: {
        flex: 1,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
