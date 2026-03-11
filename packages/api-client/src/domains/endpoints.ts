export const API_ENDPOINTS = {
  AUTH: {
    OIDC_START: '/auth/oidc/start',
    APPLE_EXCHANGE: '/auth/apple/exchange',
    APPLE_REFRESH: '/auth/apple/refresh',
    WEB_TOKEN: '/auth/web/token',
    WEB_LOGOUT: '/auth/web/logout',
    LOGOUT: '/auth/logout',
    LOGOUT_ALL: '/auth/logout-all',
  },

  ME: {
    PROFILE: '/me',
    TENANTS: '/me/tenants',
  },

  USERS: {
    LIST: '/users/',
    CREATE: '/users/',
    PROFILE: '/users/profile',
  },

  ROLES: {
    LIST: '/roles/',
    CREATE: '/roles/',
    DETAIL: (id: string) => `/roles/${id}`,
    SEARCH: '/roles/search',
    ACTIVE: '/roles/active',
    UPDATE: (id: string) => `/roles/${id}`,
    DELETE: (id: string) => `/roles/${id}`,
    ACTIVATE: (id: string) => `/roles/${id}/activate`,
    DEACTIVATE: (id: string) => `/roles/${id}/deactivate`,
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

  LOCATIONS: {
    LIST: '/locations/',
    DETAIL: (id: string) => `/locations/${id}`,
  },

  UOM: {
    LIST: '/uom/',
    DETAIL: (id: string) => `/uom/${id}`,
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
