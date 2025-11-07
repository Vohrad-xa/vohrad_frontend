import React from 'react';
import {ThemedText} from '@/components/ui';
import type {ItemDetail} from '@vohrad/store';

interface LocationsProps {
  itemId?: string;
  item?: ItemDetail;
}

export function Locations({
  itemId: _itemId,
  item: _item,
}: LocationsProps): React.JSX.Element {
  return <ThemedText variant="label">Locations</ThemedText>;
}
