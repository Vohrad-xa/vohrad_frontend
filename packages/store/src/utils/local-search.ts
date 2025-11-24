import type {Item} from '@vohrad/types';

// local/client-side search for items
export function searchItemsLocally(items: Item[], searchQuery: string): Item[] {
  if (!searchQuery || searchQuery.trim().length === 0) {
    return items;
  }

  const term = searchQuery.toLowerCase().trim();

  return items.filter((item) => {
    const name = item.name?.toLowerCase() || '';
    const sku = item.sku?.toLowerCase() || '';
    const description = item.description?.toLowerCase() || '';
    const barcode = item.barcode?.toLowerCase() || '';

    return (
      name.includes(term) ||
      sku.includes(term) ||
      description.includes(term) ||
      barcode.includes(term)
    );
  });
}
