import React from 'react';
import {ScrollView} from 'react-native';
import {ItemSpecifications} from '@/features/item';

export default function SpecificationsModal() {
  return (
    <ScrollView>
      <ItemSpecifications />
    </ScrollView>
  );
}
