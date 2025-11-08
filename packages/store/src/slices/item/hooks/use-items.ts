import {useAuthStore} from '../../../store';
import {itemSelectors} from '../selectors';

export function useItems() {
  const items = useAuthStore(itemSelectors.items);
  const total = useAuthStore(itemSelectors.total);
  const page = useAuthStore(itemSelectors.page);
  const size = useAuthStore(itemSelectors.size);
  const totalPages = useAuthStore(itemSelectors.totalPages);
  const hasNext = useAuthStore(itemSelectors.hasNext);
  const hasPrevious = useAuthStore(itemSelectors.hasPrevious);
  const links = useAuthStore(itemSelectors.links);
  const isLoading = useAuthStore(itemSelectors.isLoading);
  const error = useAuthStore(itemSelectors.error);

  return {
    items,
    total,
    page,
    size,
    totalPages,
    hasNext,
    hasPrevious,
    links,
    isLoading,
    error,
  };
}
