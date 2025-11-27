export const API_ENDPOINTS = {
  AUTH: {
    LOGIN_USER: '/auth/login/user',
    LOGIN_ADMIN: '/auth/login/admin',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    LOGOUT_ALL: '/auth/logout-all',
  },
  USERS: {
    LIST: '/users/',
    ME: '/users/me',
    UPDATE_PROFILE: '/users/me',
  },
  EMAIL_VERIFICATION: {
    RESEND: '/email-verification/resend',
    CONFIRM: '/email-verification/confirm',
    CONFIRM_PUBLIC: '/email-verification/confirm/public',
  },
  TENANT: {
    INFO: '/tenant/',
    SETTINGS: '/tenant/settings',
    PROFILE: '/tenant/profile',
    LICENSE_INFO: '/tenant/license-info',
  },
  ITEMS: {
    LIST: '/items/',
    CREATE: '/items/',
    DETAIL: (id: string) => `/items/${id}`,
    BY_SKU: (sku: string) => `/items/sku/${sku}`,
    BY_BARCODE: (barcode: string) => `/items/barcode/${barcode}`,
    BY_SERIAL: (serial: string) => `/items/serial/${serial}`,
    UPDATE: (id: string) => `/items/${id}`,
    DELETE: (id: string) => `/items/${id}`,
    UPDATE_LOCATION: (itemId: string, locationId: string) =>
      `/items/${itemId}/locations/${locationId}`,
    DELETE_LOCATION: (itemId: string, locationId: string) =>
      `/items/${itemId}/locations/${locationId}`,
  },
  ITEM_LOCATIONS: {
    UPDATE: (itemLocationId: string) => `/item-locations/${itemLocationId}`,
    DELETE: (itemLocationId: string) => `/item-locations/${itemLocationId}`,
  },
  ATTACHMENTS: {
    LIST: '/attachments/',
    CREATE: '/attachments/',
    DETAIL: (id: string) => `/attachments/${id}`,
    DELETE: (id: string) => `/attachments/${id}`,
    LINK: (id: string) => `/attachments/${id}/link`,
    UNLINK: (id: string) => `/attachments/${id}/link`,
    GET_URL: (id: string) => `/attachments/${id}/url`,
  },
  SYSTEM: {
    DASHBOARD_OVERVIEW: '/system/dashboard/overview',
  },
} as const;
export type ApiEndpoint =
  (typeof API_ENDPOINTS)[keyof typeof API_ENDPOINTS][keyof (typeof API_ENDPOINTS)[keyof typeof API_ENDPOINTS]];
