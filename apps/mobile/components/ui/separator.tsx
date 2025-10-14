import React from 'react';
import {View, StyleSheet} from 'react-native';
import {useTheme} from '@/providers';

export function Separator() {
  const {ds, theme} = useTheme();

  return (
    <View
      style={{
        height: StyleSheet.hairlineWidth,
        backgroundColor: theme.divider,
        marginHorizontal: ds.spacing.md,
        opacity: 0.8,
      }}
    />
  );
}
