import api from '../config/api';
import { LoginFormData, AuthResponse, User, Tenant, UserRole, UserType } from '../types';

// Local storage helpers for auth
export const tokenStorage = {
  get: () => localStorage.getItem('token'),
  set: (token: string) => localStorage.setItem('token', token),
  remove: () => localStorage.removeItem('token'),
};

export const userStorage = {
  get: () => {
    try {
      const data = localStorage.getItem('userData');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },
  set: (userData: { user?: User; tenant?: Tenant; userType: UserType; role: UserRole }) => {
    localStorage.setItem('userData', JSON.stringify(userData));
  },
  remove: () => localStorage.removeItem('userData'),
};

export const authService = {
  async login(credentials: LoginFormData): Promise<{ userData: User | Tenant; role: UserRole; token: string }> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Login failed');
      }

      const { data } = response.data;
      const { token, userType } = data;
      
      let role: UserRole;
      let userData: User | Tenant;

      if (userType === 'user' && data.user) {
        role = data.user.role;
        userData = data.user;
      } else if (userType === 'tenant' && data.tenant) {
        role = 'tenant';
        userData = data.tenant;
      } else {
        throw new Error('Invalid user data received');
      }

      tokenStorage.set(token);
      userStorage.set({ user: data.user, tenant: data.tenant, userType, role });

      return { userData, role, token };
    } catch (error: any) {
      tokenStorage.remove();
      userStorage.remove();
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userRole');
      
      if (error.response?.status === 401) {
        throw new Error('Invalid email or password. Please check your credentials and try again.');
      } else if (error.response?.status === 400) {
        if (error.response?.data?.message?.includes('Validation failed')) {
          throw new Error('Please enter a valid email address and password.');
        } else if (error.response?.data?.message?.includes('email')) {
          throw new Error('Please enter a valid email address.');
        } else if (error.response?.data?.message?.includes('password')) {
          throw new Error('Please enter a valid password.');
        } else {
          throw new Error('Invalid input. Please check your email and password format.');
        }
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Login failed. Please try again.');
      }
    }
  },

  async getCurrentUser(): Promise<{ userData: User | Tenant; role: UserRole } | null> {
    try {
      const token = tokenStorage.get();
      if (!token) {
        return null;
      }

      const response = await api.get<AuthResponse>('/auth/me');
      
      if (!response.data.success) {
        throw new Error('Invalid session');
      }

      const { data } = response.data;
      const { userType } = data;
      
      let role: UserRole;
      let userData: User | Tenant;

      if (userType === 'user' && data.user) {
        role = data.user.role;
        userData = data.user;
      } else if (userType === 'tenant' && data.tenant) {
        role = 'tenant';
        userData = data.tenant;
      } else {
        throw new Error('Invalid user data received');
      }

      userStorage.set({ user: data.user, tenant: data.tenant, userType, role });

      return { userData, role };
    } catch (error) {
      authService.logout();
      return null;
    }
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      tokenStorage.remove();
      userStorage.remove();
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userRole');
    }
  },

  isAuthenticated(): boolean {
    return !!tokenStorage.get();
  },

  getUserRole(): UserRole | null {
    const userData = userStorage.get();
    return userData?.role || null;
  },

  getUserData(): User | Tenant | null {
    const userData = userStorage.get();
    return userData?.user || userData?.tenant || null;
  },
  
  async requestPasswordReset(email: string): Promise<void> {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      if (!response.data?.success) throw new Error(response.data?.message || 'Request failed');
    } catch (err: any) {
      if (err.response?.data?.message) throw new Error(err.response.data.message);
      throw err;
    }
  },

  async verifyOTP(email: string, otp: string): Promise<void> {
    try {
      const response = await api.post('/auth/verify-otp', { email, otp });
      if (!response.data?.success) throw new Error(response.data?.message || 'Verification failed');
    } catch (err: any) {
      if (err.response?.data?.message) throw new Error(err.response.data.message);
      throw err;
    }
  },

  async resetPasswordWithOTP(payload: { email: string; otp: string; newPassword: string; confirmPassword: string }): Promise<void> {
    try {
      const response = await api.post('/auth/reset-password', payload);
      if (!response.data?.success) throw new Error(response.data?.message || 'Reset failed');
    } catch (err: any) {
      if (err.response?.data?.message) throw new Error(err.response.data.message);
      throw err;
    }
  },
};