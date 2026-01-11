import {useCallback, useMemo, useState} from 'react';

type SelectionMode = 'latched' | 'explicit';

type UseAttachmentsSelectionOptions = {
  mode?: SelectionMode;
};

export type AttachmentsSelectionController<T extends {id: string}> = {
  isSelectionMode: boolean;
  selectedCount: number;
  selectionVersion: number;
  isSelected: (id: string) => boolean;
  toggleSelection: (id: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  enableSelectionMode: () => void;
  disableSelectionMode: () => void;
  getSelectedItems: () => T[];
};

/**
 * Shared selection controller for attachment lists and grids.
 *
 * - "latched" keeps selection mode active until explicitly disabled.
 */
export function useAttachmentsSelection<T extends {id: string}>(
  items: T[],
  options: UseAttachmentsSelectionOptions = {},
): AttachmentsSelectionController<T> {
  const {mode = 'latched'} = options;
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectionVersion, setSelectionVersion] = useState(0);
  const [forcedSelectionMode, setForcedSelectionMode] = useState(false);
  const isLatched = mode === 'latched';

  const selectedCount = useMemo(() => selectedIds.size, [selectedIds.size]);

  const isSelectionMode = useMemo(() => {
    if (!isLatched) return forcedSelectionMode;
    return forcedSelectionMode || selectedIds.size > 0;
  }, [forcedSelectionMode, selectedIds.size, isLatched]);

  const bumpSelection = useCallback(() => {
    setSelectionVersion((prev) => prev + 1);
  }, []);

  const isSelected = useCallback(
    (id: string) => selectedIds.has(id),
    [selectedIds],
  );

  const toggleSelection = useCallback(
    (id: string) => {
      if (isLatched) setForcedSelectionMode(true);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });
      bumpSelection();
    },
    [bumpSelection, isLatched],
  );

  const selectAll = useCallback(() => {
    if (isLatched) setForcedSelectionMode(true);
    setSelectedIds(new Set(items.map((item) => item.id)));
    bumpSelection();
  }, [items, bumpSelection, isLatched]);

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set());
    bumpSelection();
  }, [bumpSelection]);

  const enableSelectionMode = useCallback(() => {
    setForcedSelectionMode(true);
  }, []);

  const disableSelectionMode = useCallback(() => {
    setForcedSelectionMode(false);
    setSelectedIds(new Set());
    bumpSelection();
  }, [bumpSelection]);

  const getSelectedItems = useCallback(
    () => items.filter((item) => selectedIds.has(item.id)),
    [items, selectedIds],
  );

  return {
    isSelectionMode,
    selectedCount,
    selectionVersion,
    isSelected,
    toggleSelection,
    selectAll,
    deselectAll,
    enableSelectionMode,
    disableSelectionMode,
    getSelectedItems,
  };
}
