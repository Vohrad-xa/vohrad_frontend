export const API_ENDPOINTS = {
  AUTH: {
    LOGIN_USER: '/auth/login/user',
    LOGIN_ADMIN: '/auth/login/admin',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    LOGOUT_ALL: '/auth/logout-all',
  },
  USERS: {
    ME: '/users/me',
    UPDATE_PROFILE: '/users/me',
    RESEND_PENDING_EMAIL: '/users/me/email/resend',
    CONFIRM_PENDING_EMAIL: '/users/me/email/confirm',
    CONFIRM_PENDING_EMAIL_PUBLIC: '/users/email/confirm',
  },
  TENANT: {
    INFO: '/tenant',
    SETTINGS: '/tenant/settings',
    LICENSE_INFO: '/tenant/license-info',
  },
} as const;
export type ApiEndpoint =
  (typeof API_ENDPOINTS)[keyof typeof API_ENDPOINTS][keyof (typeof API_ENDPOINTS)[keyof typeof API_ENDPOINTS]];
