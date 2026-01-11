import {useState, useCallback, useMemo} from 'react';
import type {ImageAttachmentItem} from './use-image-items';

export function useImageSelection(images: ImageAttachmentItem[]) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const selectedCount = useMemo(() => selectedIds.size, [selectedIds.size]);

  const toggleSelection = useCallback((image: ImageAttachmentItem) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(image.id)) {
        newSet.delete(image.id);
      } else {
        newSet.add(image.id);
      }
      return newSet;
    });
  }, []);

  const isSelected = useCallback(
    (image: ImageAttachmentItem) => {
      return selectedIds.has(image.id);
    },
    [selectedIds],
  );

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(images.map((img) => img.id)));
  }, [images]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedCount === images.length) {
      clearSelection();
    } else {
      selectAll();
    }
  }, [selectedCount, images.length, selectAll, clearSelection]);

  const enableSelectionMode = useCallback(() => {
    setIsSelectionMode(true);
    clearSelection();
  }, [clearSelection]);

  const disableSelectionMode = useCallback(() => {
    setIsSelectionMode(false);
    clearSelection();
  }, [clearSelection]);

  const getSelectedImages = useCallback(() => {
    return images.filter((img) => selectedIds.has(img.id));
  }, [images, selectedIds]);

  return {
    isSelectionMode,
    selectedIds,
    selectedCount,
    toggleSelection,
    isSelected,
    selectAll,
    clearSelection,
    toggleSelectAll,
    enableSelectionMode,
    disableSelectionMode,
    getSelectedImages,
  };
}
