import api from './api';

export interface AuthUser {
  id: number | string;
  email?: string;
  role: string;
  full_name?: string;
  mobile?: string;
}

export const loginUser = (user: AuthUser) => {
  localStorage.setItem("user", JSON.stringify(user));
};

export const logoutUser = async () => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.error('Logout API error:', error);
  } finally {
    localStorage.removeItem("user");
    localStorage.removeItem("technician_token");
  }
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem("user");
};

export const getCurrentUser = (): AuthUser | null => {
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;
  try {
    return JSON.parse(userStr) as AuthUser;
  } catch (e) {
    return null;
  }
};

export const requestPasswordResetOtp = async (mobile: string) => {
  const response = await api.post('/auth/technician/forgot-password', { mobile });
  return response.data;
};

export const resetPassword = async (payload: any) => {
  const response = await api.post('/auth/technician/reset-password', payload);
  return response.data;
};

