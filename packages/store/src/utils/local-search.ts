import type {Item, User} from '@vohrad/types';

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

// local/client-side search for users
export function searchUsersLocally(users: User[], searchQuery: string): User[] {
  if (!searchQuery || searchQuery.trim().length === 0) {
    return users;
  }

  const term = searchQuery.toLowerCase().trim();

  return users.filter((user) => {
    const firstName = user.first_name?.toLowerCase() || '';
    const lastName = user.last_name?.toLowerCase() || '';
    const email = user.email?.toLowerCase() || '';
    const role = user.role?.toLowerCase() || '';

    return (
      firstName.includes(term) ||
      lastName.includes(term) ||
      email.includes(term) ||
      role.includes(term)
    );
  });
}
