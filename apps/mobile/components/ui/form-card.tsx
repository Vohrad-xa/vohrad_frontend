import React from 'react';
import {FlatList, View, StyleSheet} from 'react-native';
// import {Separator} from '@/components/ui';
import {useTheme} from '@/providers';
// import {DesignSystem} from '@/constants/typography';

type FormCardProps<T> = {
  data: T[];
  keyExtractor: (item: T, index: number) => string;
  renderItem: ({item, index}: {item: T; index: number}) => React.ReactElement;
  // If you need scroll, pass scrollEnabled; default false to match Profile
  scrollEnabled?: boolean;
};

export function FormCard<T>({
  data,
  keyExtractor,
  renderItem,
  scrollEnabled = false,
}: FormCardProps<T>) {
  const {ds, theme} = useTheme();
  const styles = StyleSheet.create({
    card: {
      borderRadius: ds.components.card.borderRadius,
      backgroundColor: theme.input,
    },
    row: {
      minHeight: ds.components.listItem.minHeight,
      paddingVertical: ds.spacing.sm,
      paddingHorizontal: ds.spacing.md,
      justifyContent: 'center',
    },
  });

  return (
    <View style={styles.card}>
      <FlatList
        data={data}
        keyExtractor={keyExtractor}
        renderItem={({item, index}) => (
          <View style={styles.row}>{renderItem({item, index})}</View>
        )}
        // ItemSeparatorComponent={Separator}
        scrollEnabled={scrollEnabled}
      />
    </View>
  );
}
