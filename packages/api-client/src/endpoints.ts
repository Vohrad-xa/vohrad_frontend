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
} as const;
export type ApiEndpoint =
  (typeof API_ENDPOINTS)[keyof typeof API_ENDPOINTS][keyof (typeof API_ENDPOINTS)[keyof typeof API_ENDPOINTS]];
