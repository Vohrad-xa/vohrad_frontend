import type {OrderByDirection} from './attachment';

export type UserSortKey = 'date' | 'name' | 'role';

export type UserSortState = {
  key: UserSortKey;
  direction: OrderByDirection;
};
