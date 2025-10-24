import {Platform, StyleSheet} from 'react-native';
import {Stack, useLocalSearchParams, useRouter} from 'expo-router';
import {ThemedView, ThemedText, HeaderButton} from '@/components/ui';
import {type DSShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {AppIcons} from '@/utils';
import {makeStyleFactory} from '@/utils/style-factory';

export default function ItemDetailScreen() {
  const {id: _id} = useLocalSearchParams<{id: string}>();
  const {ds} = useTheme();
  const router = useRouter();
  const styles = createStyles(ds);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Item Details',
          headerLeft: () => (
            <HeaderButton
              icon={AppIcons.navigation.back}
              onPress={() => router.back()}
              iconColorToken="text"
              accessibilityLabel="Back"
              iconSize={Platform.OS === 'android' ? 'xxl' : 'lg'}
            />
          ),
        }}
      />
      <ThemedView style={styles.container} />
    </>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape) =>
    StyleSheet.create({
      container: {
        flex: 1,
        padding: ds.spacing.lg,
      },
    }),
  (ds) => `${ds.version}`,
);
