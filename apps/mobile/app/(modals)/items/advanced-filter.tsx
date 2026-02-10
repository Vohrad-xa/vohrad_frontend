import React, {useLayoutEffect} from 'react';
import {Platform, ScrollView} from 'react-native';
import {useNavigation} from 'expo-router';
import {ThemedText} from '@/components/ui';
import {Palette} from '@/constants';
import {AppIcons} from '@/utils';
import {
  getHeaderOptions,
  type HeaderButtonAction,
} from '@/utils/navigation/header-actions';

export default function AdvancedFilterModal() {
  const navigation = useNavigation();

  const handleReset = () => {};
  const handleSave = () => {};

  const saveIcon = AppIcons.actions.save;

  useLayoutEffect(() => {
    const right: HeaderButtonAction[] = [
      {
        type: 'button',
        key: 'reset',
        label: 'Reset',
        icon: AppIcons.actions.refresh, // android and web, ios shows text
        onPress: handleReset,
        accessibilityLabel: 'Reset advanced filters',
      },
      {
        type: 'button',
        key: 'save',
        label: 'Save',
        iosSymbol: saveIcon,
        icon: saveIcon,
        variant: 'prominent',
        tintColor: Platform.OS === 'ios' ? Palette.orange : undefined,
        onPress: handleSave,
        accessibilityLabel: 'Save advanced filters',
      },
    ];

    const options = getHeaderOptions({right});

    navigation.setOptions({
      headerRight: options.headerRight,
      unstable_headerRightItems: options.unstable_headerRightItems,
    });
  }, [navigation, saveIcon]);

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" style={{flex: 1}}>
      <ThemedText>This is where the advanced filters will go.</ThemedText>
    </ScrollView>
  );
}
