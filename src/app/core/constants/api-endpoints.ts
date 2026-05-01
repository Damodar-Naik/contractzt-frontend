export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: 'auth/login',
    SIGNUP: 'auth/signup', // Updated from register to signup
    REFRESH: 'auth/refresh'
  },
  CONTRACTS: {
    LIST: 'contracts',
    DETAIL: (id: string) => `contracts/${id}`,
    UPDATE: (id: string) => `contracts/${id}`,
    UPDATE_STATUS: (id: string) => `contracts/${id}/status`,
  }
};
