import { apiRequest } from './api';

export const authService = {
  login: async (email, password) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
  },

  register: async (userData) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: userData,
    });
  },

  getPerfil: async () => {
    return apiRequest('/auth/perfil');
  },

  forgotPassword: async (email) => {
    return apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: { email },
    });
  },

  resetPassword: async (email, code, newPassword) => {
    return apiRequest('/auth/reset-password', {
      method: 'POST',
      body: {
        email,
        code,
        new_password: newPassword,
      },
    });
  },
};

