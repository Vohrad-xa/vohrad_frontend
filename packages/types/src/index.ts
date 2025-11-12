// Auth types
export type {AuthState, AuthContextValue, AsyncState} from './auth';

// API types
export type {
  ApiResponse,
  ApiResponseMetadata,
  PaginatedResponse,
  PaginationLinks,
} from './api';

export {ApiError} from './api';

// Schema types (validated data contracts)
export type {
  User,
  AuthTokens,
  BaseCredentials,
  UserCredentials,
  AdminCredentials,
  RefreshTokenRequest,
  TokenResponse,
  UserUpdateData,
  Email,
} from './schemas';

// Tenant types
export type {
  Tenant,
  TenantSettingsUpdate,
  TenantProfileUpdate,
  TenantLicenseInfo,
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
} from './item';

// Attachment types
export type {
  AttachmentTargetType,
  AttachmentKind,
  AttachmentFilter,
} from './attachment';

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
