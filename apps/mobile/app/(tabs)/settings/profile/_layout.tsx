import {Platform} from 'react-native';
import {type NativeStackNavigationOptions} from '@react-navigation/native-stack';
import {router, Stack} from 'expo-router';
import {HeaderButton} from '@/components/ui';
import {useTheme} from '@/providers';
import {baseStackOptions, sectionTitleStyle} from '@/utils/navigation';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function ProfileLayout() {
  const {theme, ds} = useTheme();

  const modalOptions = {
    presentation: 'modal' as const,
    headerLeft: () =>
      Platform.OS === 'ios' ? (
        <HeaderButton
          variant="close"
          accessibilityLabel="Close"
          accessibilityHint="Closes the modal"
          onPress={() => router.dismiss()}
        />
      ) : undefined,
  };

  const screenOptions = {
    ...baseStackOptions(theme),
    headerLargeTitleStyle: {
      fontWeight: ds.fontWeight.bold,
    },
    contentStyle: {
      paddingHorizontal: Platform.OS !== 'ios' ? ds.spacing.md : undefined,
    },
  } satisfies NativeStackNavigationOptions;

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen
        name="index"
        options={{
          title: 'Profile',
          headerShown: Platform.OS !== 'ios',
          headerTitleStyle: sectionTitleStyle(theme),
        }}
      />
      <Stack.Screen
        name="birth-date"
        options={{title: 'Date of Birth', ...modalOptions}}
      />
      <Stack.Screen name="name" options={{title: 'Name', ...modalOptions}} />
      <Stack.Screen name="email" options={{title: 'Email', ...modalOptions}} />
      <Stack.Screen
        name="phone"
        options={{title: 'Phone Number', ...modalOptions}}
      />
      <Stack.Screen
        name="address"
        options={{title: 'Address', ...modalOptions}}
      />
    </Stack>
  );
}
