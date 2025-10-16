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
} as const;
export type ApiEndpoint =
  (typeof API_ENDPOINTS)[keyof typeof API_ENDPOINTS][keyof (typeof API_ENDPOINTS)[keyof typeof API_ENDPOINTS]];
