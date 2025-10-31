import React from 'react';
import {View} from 'react-native';
import {ModalScrollView} from '@/components/ui';
import {useTheme} from '@/providers';

export default function QuantityModal() {
  const {ds} = useTheme();

  return (
    <ModalScrollView>
      <View style={{padding: ds.spacing.md}}>
        {/* Quantity content will go here */}
      </View>
    </ModalScrollView>
  );
}
