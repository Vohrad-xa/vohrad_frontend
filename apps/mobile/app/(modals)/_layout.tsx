import {Platform, StyleSheet} from 'react-native';
import {Stack} from 'expo-router';
import {type ThemeShape} from '@/constants/theme';
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
      <Stack.Screen name="settings" />
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
        backgroundColor:
          Platform.OS === 'web' ? theme.webbackground : theme.secondbackground,
      },
    }),
  (theme) => theme.version.toString(),
);
