import {Platform} from 'react-native';
import {Stack} from 'expo-router';
import {useTheme, useSidebar} from '@/providers';
import {Host, Button, HStack, Image, frame} from '@/modules/sykamore-ui';

export default function EventsLayout() {
  const {theme} = useTheme();
  const {toggleSideMenu} = useSidebar();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerShadowVisible: false,
        headerTransparent: Platform.OS === 'ios',
        headerStyle: {
          backgroundColor:
            Platform.OS === 'android' ? theme.navigationBar : undefined,
        },
        headerTitleStyle: {color: theme.text},
        headerTitleAlign: 'center',
        headerLeft: () => (
          <Host matchContents>
            <HStack>
              <Button onPress={toggleSideMenu}>
                <Image
                  size={22}
                  systemName="line.3.horizontal.decrease"
                  color={theme.text}
                  modifiers={[frame({width: 35})]}
                />
              </Button>
            </HStack>
          </Host>
        ),
        headerRight: () => (
          <Host matchContents>
            <HStack>
              <Button onPress={toggleSideMenu}>
                <Image
                  size={22}
                  systemName="bell"
                  color={theme.text}
                  modifiers={[frame({width: 45})]}
                />
              </Button>

              <Button onPress={toggleSideMenu}>
                <Image
                  size={22}
                  systemName="bag.badge.plus"
                  color={theme.text}
                  modifiers={[frame({width: 45})]}
                />
              </Button>
            </HStack>
          </Host>
        ),
      }}
    />
  );
}
