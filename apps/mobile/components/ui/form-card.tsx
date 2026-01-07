import React from 'react';
import {FlatList, View, StyleSheet} from 'react-native';
import {Divider} from 'react-native-paper';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils/style-factory';

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
  const styles = createStyles(ds, theme);

  const renderSeparator = () => (
    <View style={styles.separatorContainer}>
      <Divider style={styles.separator} />
    </View>
  );

  return (
    <View style={styles.card}>
      <FlatList
        data={data}
        keyExtractor={keyExtractor}
        renderItem={({item, index}) => (
          <View style={styles.row}>{renderItem({item, index})}</View>
        )}
        ItemSeparatorComponent={renderSeparator}
        scrollEnabled={scrollEnabled}
      />
    </View>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape, theme: ThemeShape) =>
    StyleSheet.create({
      card: {
        borderRadius: ds.components.card.borderRadius,
        backgroundColor: theme.input,
        ...ds.shadows.sm,
      },
      row: {
        minHeight: ds.components.listItem.minHeight,
        paddingVertical: ds.spacing.lg,
        paddingHorizontal: ds.spacing.md,
        justifyContent: 'center',
      },
      separatorContainer: {
        paddingHorizontal: ds.spacing.md,
      },
      separator: {
        marginVertical: 0,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
