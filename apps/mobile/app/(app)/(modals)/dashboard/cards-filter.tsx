import React from 'react';
import {Platform} from 'react-native';
import {Stack, router} from 'expo-router';
import {HeaderButton} from '@/components/ui';
import {FilterContent} from '@/features/dashboard';
import {useTheme} from '@/providers';

const CloseHeaderLeft = () => (
  <HeaderButton
    variant="close"
    accessibilityLabel="Close Filter Modal"
    onPress={() => router.dismiss()}
  />
);

export default function FilterModal() {
  const {theme} = useTheme();

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Filter',
          headerShown: true,
          headerShadowVisible: false,
          headerTransparent: Platform.OS === 'ios',
          headerLeft: Platform.OS === 'ios' ? CloseHeaderLeft : undefined,
          headerTitleStyle: {
            fontSize: Platform.OS !== 'ios' ? 28 : undefined,
            color: Platform.OS !== 'ios' ? theme.tint2 : undefined,
          },
        }}
      />
      <FilterContent />
    </>
  );
}
