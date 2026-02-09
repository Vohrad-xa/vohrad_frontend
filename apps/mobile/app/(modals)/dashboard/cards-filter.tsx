import React from 'react';
import {Platform} from 'react-native';
import {Stack} from 'expo-router';
import {FilterContent} from '@/features/dashboard';
import {useTheme} from '@/providers';

export default function FilterModal() {
  const {theme} = useTheme();

  return (
    <>
      <Stack.Screen
        options={{
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
