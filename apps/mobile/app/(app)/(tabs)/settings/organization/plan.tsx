import React from 'react';
import {ModalScrollView} from '@/components/ui';
import {PlanScreen} from '@/features/settings';

export default function PlanModalScreen() {
  return (
    <ModalScrollView>
      <PlanScreen />
    </ModalScrollView>
  );
}
