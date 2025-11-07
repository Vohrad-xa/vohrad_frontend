import React from 'react';
import {ModalScrollView} from '@/components/ui';
import {ItemSpecifications} from '@/features/item';

export default function SpecificationsModal() {
  return (
    <ModalScrollView>
      <ItemSpecifications />
    </ModalScrollView>
  );
}
