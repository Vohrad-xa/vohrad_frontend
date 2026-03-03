// Auth types
export type {
  AuthState,
  AuthContextValue,
  AsyncState,
  MobileOidcLoginParams,
} from './auth';

// API types
export type {
  ApiResponse,
  ApiResponseMetadata,
  PaginatedResponse,
  CursorDirection,
  CursorOrder,
} from './api';

export {ApiError} from './api';

// Schema types (validated data contracts)
export type {
  Identity,
  AuthTokens,
  TokenResponse,
  User,
  UserCreateData,
  UserUpdateData,
  Email,
} from './schemas';

// Role types
export type {
  Role,
  RoleCreate,
  RoleUpdate,
  RoleType,
  RoleScope,
  RoleStage,
} from './schemas';

// Tenant types
export type {
  Tenant,
  TenantMembership,
  TenantSettingsUpdate,
  TenantProfileUpdate,
  TenantLicenseInfo,
  License,
  JsonValue,
} from './tenant';

// Item types
export type {
  Item,
  ItemDetail,
  ItemCreate,
  ItemUpdate,
  ItemSpecifications,
  ItemLocationData,
  ItemLocationInput,
  ItemAttachment,
  ItemFilterState,
  ItemLocationUpdate,
  Category,
  Status,
  TrackingMode,
  UnitOfMeasure,
} from './item';

// Location types
export type {Location, LocationCreate, LocationUpdate} from './schemas';

// Attachment types
export type {
  AttachmentTargetType,
  AttachmentKind,
  AttachmentFilter,
  OrderByDirection,
  OrderByClause,
  AttachmentSortKey,
  AttachmentSortState,
} from './attachment';

// User sorting types
export type {UserSortKey, UserSortState} from './user';

// Namespaced exports for advanced usage
export * as schemas from './schemas';
export * as validation from './validation';

// Email validation utilities
export {
  emailSchema,
  suggestEmailCorrection,
  validateEmail,
  isEmail,
  type EmailInput,
  type EmailValidationResult,
} from './validation/email';

// User validation utilities
export {userUpdateSchema, validateUserUpdate} from './validation/user';

// Role validation utilities
export {
  validateRole,
  validateRoleCreate,
  validateRoleUpdate,
} from './validation/role';

// Location validation utilities
export {
  validateLocation,
  validateLocationCreate,
  validateLocationUpdate,
} from './validation/location';

// Validation helpers
export {
  patterns,
  messages,
  commonRefinements,
  transformations,
  createNameSchema,
  createPhoneSchema,
  createDateSchema,
  createPostalCodeSchema,
  basePhoneSchema,
  baseDateSchema,
  optionalNullable,
  validateAgainstPatterns,
  baseSchemas,
} from './validation/helpers';
