export {useAuthStore, AUTH_PERSIST_KEY} from './store';
export type {StoreState} from './store';
export {setAuthPersistStorage} from './utils/storage';
export {shallow} from 'zustand/shallow';

export {
  authSelectors,
  useProfileDetails,
  useFetchUserProfile,
  useUpdateProfile,
  useEmailConfirmation,
  useProfileManager,
  type AuthSlice,
} from './slices/auth';

export {
  useFetchTenant,
  useFetchLicenseInfo,
  useUpdateTenantProfile,
  useUpdateTenantSettings,
  useTenantManager,
  useLicenseInfoManager,
  buildTenantQueryKey,
  buildTenantLicenseQueryKey,
  type TenantSlice,
} from './slices/tenant';

export {
  systemSelectors,
  useDashboardOverview,
  useDashboardVisibility,
  useSetDashboardVisibility,
  useResetDashboardVisibility,
  defaultDashboardVisibility,
  type SystemSlice,
  type DashboardCardKey,
  type DashboardVisibilityState,
} from './slices/system';

export {
  useFetchItem,
  useCreateItem,
  useUpdateItem,
  useDeleteItem,
  useUpdateItemLocation,
  useItemsManager,
  useItemDetailManager,
  useItemFiltersManager,
} from './slices/item';

export {
  useInfiniteRoles,
  useFetchRole,
  useActiveRoles,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
  useActivateRole,
  useDeactivateRole,
  useRolesListManager,
  useRoleDetailManager,
} from './slices/role';

export {useInfiniteUnits, useUnitsListManager} from './slices/uom';

export {
  useInfiniteUsers,
  useUsersListManager,
  useCreateUser,
  buildUserOrderBy,
  parseUserOrderBy,
} from './slices/user';

export {
  useAttachmentsListManager,
  useAttachmentsViewManager,
  useFilteredAttachmentsManager,
  useDeleteAttachment,
  useFetchTargetAttachments,
  useInfiniteAttachments,
  useUploadAttachment,
  buildAttachmentSearchFilter,
  buildAttachmentSearchODataFilter,
  buildAttachmentODataFilter,
  getAttachmentExtension,
  hasAttachmentExtension,
  buildAttachmentOrderBy,
  parseAttachmentOrderBy,
  type UseAttachmentsViewManagerOptions,
  type UseFilteredAttachmentsManagerOptions,
  type AttachmentDisplayItem,
  type AttachmentIconKey,
} from './slices/attachment';

export {
  useAttachmentFilter,
  useSetAttachmentFilter,
  useClearAttachmentFilter,
  useUpdateAttachmentFilter,
  type FilterSlice,
} from './slices/filter';

export {
  hasActiveFilters,
  clearAllFilters,
  type ItemListFilters,
} from './slices/item';

export {
  buildUserODataFilter,
  hasActiveUserFilters,
  clearUserFilters,
  type UserFilterOptions,
  type UserFilterState,
} from './slices/user';

export {buildODataOrderBy} from './utils/odata-orderby-builder';
export {searchUsersLocally} from './utils/local-search';
export type {AsyncState, PaginatedState} from './utils/state';
export {
  resolveAttachmentPreviewUrl,
  resolveAttachmentThumbnailUrl,
  resolveAttachmentItemUrl,
} from './utils/attachment-urls';

export type {
  User,
  AuthTokens,
  Tenant,
  TenantLicenseInfo,
  License,
  Item,
  ItemDetail,
  ItemLocationUpdate,
  Role,
  RoleType,
  RoleScope,
  RoleStage,
  AttachmentTargetType,
  AttachmentKind,
  AttachmentSortKey,
  AttachmentSortState,
  AttachmentFilter,
  OrderByClause,
  OrderByDirection,
  UserSortKey,
  UserSortState,
} from '@sykamore/types';

export {queryClient, QueryProvider} from './query';
export {onlineManager, focusManager} from '@tanstack/react-query';
