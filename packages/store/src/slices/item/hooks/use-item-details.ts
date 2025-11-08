import {useAuthStore} from '../../../store';
import {itemSelectors} from '../selectors';

export function useItemDetails() {
  const selectedItem = useAuthStore(itemSelectors.selectedItem);
  const isLoading = useAuthStore(itemSelectors.isLoading);
  const error = useAuthStore(itemSelectors.error);

  return {
    item: selectedItem,
    isLoading,
    error,
  };
}
