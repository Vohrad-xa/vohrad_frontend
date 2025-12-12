import {StyleSheet} from 'react-native';
import {Stack} from 'expo-router';
import {type ThemeShape} from '@/constants';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils';

export default function ModalsLayout() {
  const {theme} = useTheme();
  const styles = createStyles(theme);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: styles.modalContent,
      }}
    >
      <Stack.Screen name="dashboard/cards-filter" options={{title: 'Filter'}} />
      <Stack.Screen name="scan/index" options={{title: 'Scan'}} />
      <Stack.Screen name="items" options={{title: 'Items'}} />
      <Stack.Screen name="preview" options={{title: 'Preview'}} />
      <Stack.Screen name="attachments" options={{title: 'Attachments'}} />
    </Stack>
  );
}

const createStyles = makeStyleFactory(
  (theme: ThemeShape) =>
    StyleSheet.create({
      modalContent: {
        flex: 1,
        backgroundColor: theme.background,
      },
    }),
  (theme) => theme.version.toString(),
);
