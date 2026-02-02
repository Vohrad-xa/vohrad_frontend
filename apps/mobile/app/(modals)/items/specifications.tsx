import React from 'react';
import {Platform} from 'react-native';
import {Stack, router} from 'expo-router';
import {ModalScrollView, HeaderButton} from '@/components/ui';
import {ItemSpecifications} from '@/features/item';

const CloseHeaderLeft = () => (
  <HeaderButton
    variant="close"
    onPress={() => router.dismiss()}
    accessibilityLabel="Close"
  />
);

export default function SpecificationsModal() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Specifications',
          headerShown: true,
          headerShadowVisible: false,
          headerTransparent: Platform.OS === 'ios',
          headerLeft: Platform.OS === 'ios' ? CloseHeaderLeft : undefined,
          headerTitleAlign: 'center',
        }}
      />
      <ModalScrollView>
        <ItemSpecifications />
      </ModalScrollView>
    </>
  );
}
