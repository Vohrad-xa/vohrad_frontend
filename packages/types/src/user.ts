import type {OrderByDirection} from './attachment';

export type UserSortKey = 'date' | 'name';

export type UserSortState = {
  key: UserSortKey;
  direction: OrderByDirection;
};
