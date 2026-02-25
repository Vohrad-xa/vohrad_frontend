import type {User} from '@sykamore/types';

// local/client-side search for users
export function searchUsersLocally(
  users: User[],
  searchQuery: string,
): User[] {
  if (!searchQuery || searchQuery.trim().length === 0) {
    return users;
  }

  const term = searchQuery.toLowerCase().trim();

  return users.filter((user) => {
    const firstName = user.first_name?.toLowerCase() || '';
    const lastName = user.last_name?.toLowerCase() || '';
    const email = user.email?.toLowerCase() || '';
    const role = user.role_name?.toLowerCase() || '';

    return (
      firstName.includes(term) ||
      lastName.includes(term) ||
      email.includes(term) ||
      role.includes(term)
    );
  });
}
