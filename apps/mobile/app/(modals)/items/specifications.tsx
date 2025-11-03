import React from 'react';
import {ModalScrollView} from '@/components/ui';
import {ItemSpecifications} from '@/features/item/detail/specifications/item-specifications';

export default function SpecificationsModal() {
  return (
    <ModalScrollView>
      <ItemSpecifications />
    </ModalScrollView>
  );
}
