import {Platform, StyleSheet} from 'react-native';
import {Stack, useRouter} from 'expo-router';
import {HeaderButton, ScreenLoadingWrapper} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils/style-factory';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function ItemAttachmentsLayout() {
  const {theme, ds} = useTheme();
  const router = useRouter();
  const styles = createStyles(theme, ds);

  const handleClose = () => {
    router.dismiss();
  };

  return (
    <ScreenLoadingWrapper>
      <Stack
        screenOptions={{
          headerShown: true,
          headerShadowVisible: false,
          headerTransparent: Platform.OS === 'ios',
          headerTitleAlign: 'center',
          contentStyle: styles.container,
          headerBackButtonDisplayMode: 'minimal',
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
            headerBackVisible: false,
            headerLeft: () => (
              <HeaderButton
                variant="close"
                onPress={handleClose}
                accessibilityLabel="Close attachments"
              />
            ),
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
            presentation: 'modal',
            headerLeft: () => (
              <HeaderButton
                variant="close"
                onPress={handleClose}
                accessibilityLabel="Close image preview"
              />
            ),
          }}
        />
      </Stack>
    </ScreenLoadingWrapper>
  );
}

const createStyles = makeStyleFactory(
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
