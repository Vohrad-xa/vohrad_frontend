import {Platform, StyleSheet} from 'react-native';
import {Stack, useRouter} from 'expo-router';
import {HeaderButton, ScreenLoadingWrapper} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils';

export default function AttachmentsModalLayout() {
  const router = useRouter();
  const {theme, ds} = useTheme();
  const styles = useStyles(theme, ds);

  return (
    <ScreenLoadingWrapper>
      <Stack
        screenOptions={{
          headerTransparent: Platform.OS === 'ios',
          headerTitleAlign: 'center',
          headerBackButtonDisplayMode: 'minimal',
          contentStyle: styles.container,
          headerStyle:
            Platform.OS === 'android'
              ? {backgroundColor: theme.navigationBar}
              : undefined,
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'Attachments',
            headerLeft: () => (
              <HeaderButton
                variant="close"
                onPress={() => router.dismiss()}
                accessibilityLabel="Close attachments"
              />
            ),
          }}
        />
        <Stack.Screen
          name="add"
          options={{
            title: 'Add Attachment',
          }}
        />
        <Stack.Screen
          name="images"
          options={{
            title: 'Images',
          }}
        />
        <Stack.Screen
          name="image-preview"
          options={{
            title: 'Preview',
          }}
        />
      </Stack>
    </ScreenLoadingWrapper>
  );
}

const useStyles = makeStyleFactory(
  (theme: ThemeShape, _ds: DSShape) =>
    StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor:
          Platform.OS === 'web' ? theme.webbackground : theme.secondbackground,
      },
    }),
  (theme, ds) => themeKey(theme, ds),
);
