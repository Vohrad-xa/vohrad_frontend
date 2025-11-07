import React from 'react';
import {ThemedText} from '@/components/ui';

interface SpecificationsProps {
  itemId?: string;
}

export function Specifications({
  itemId: _itemId,
}: SpecificationsProps): React.JSX.Element {
  return <ThemedText variant="label">Specifications</ThemedText>;
}
