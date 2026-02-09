import React, {useLayoutEffect} from 'react';
import {Platform, ScrollView} from 'react-native';
import {Stack, router, useNavigation} from 'expo-router';
import {HeaderButton, ThemedText} from '@/components/ui';
import {
  getHeaderOptions,
  type HeaderButtonAction,
} from '@/utils/navigation/header-actions';

const CloseHeaderLeft = () => (
  <HeaderButton
    variant="close"
    onPress={() => router.dismiss()}
    accessibilityLabel="Close"
  />
);

export default function AdvancedFilterModal() {
  const navigation = useNavigation();

  const handleReset = () => {};
  const handleSave = () => {};

  useLayoutEffect(() => {
    const right: HeaderButtonAction[] = [
      {
        type: 'button',
        key: 'reset',
        label: 'Reset',
        iosSymbol: 'arrow.counterclockwise',
        icon: 'refresh',
        onPress: handleReset,
        accessibilityLabel: 'Reset advanced filters',
      },
      {
        type: 'button',
        key: 'save',
        label: 'Save',
        iosSymbol: 'checkmark',
        icon: 'check',
        variant: 'done',
        onPress: handleSave,
        accessibilityLabel: 'Save advanced filters',
      },
    ];

    navigation.setOptions(getHeaderOptions({right}));
  }, [navigation]);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Advanced Filters',
          headerShown: true,
          headerShadowVisible: false,
          headerTransparent: Platform.OS === 'ios',
          headerLeft: Platform.OS === 'ios' ? CloseHeaderLeft : undefined,
        }}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{flex: 1, backgroundColor: '#282727'}}
      >
        <ThemedText>This is where the advanced filters will go.</ThemedText>
      </ScrollView>
    </>
  );
}
