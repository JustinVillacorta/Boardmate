import api from '../config/api';
import { LoginFormData, AuthResponse, User, Tenant, UserRole, UserType } from '../types';

// Token management helpers
export const tokenStorage = {
  get: () => localStorage.getItem('token'),
  set: (token: string) => localStorage.setItem('token', token),
  remove: () => localStorage.removeItem('token'),
};

// User data storage helpers
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

// Authentication service
export const authService = {
  /**
   * Login user with email and password
   * Automatically detects if user is admin/staff or tenant
   */
  async login(credentials: LoginFormData): Promise<{ userData: User | Tenant; role: UserRole; token: string }> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Login failed');
      }

      const { data } = response.data;
      const { token, userType } = data;
      
      // Determine user role based on userType and user data
      let role: UserRole;
      let userData: User | Tenant;

      if (userType === 'user' && data.user) {
        role = data.user.role; // 'admin' or 'staff'
        userData = data.user;
      } else if (userType === 'tenant' && data.tenant) {
        role = 'tenant';
        userData = data.tenant;
      } else {
        throw new Error('Invalid user data received');
      }

      // Store token and user data
      tokenStorage.set(token);
      userStorage.set({ user: data.user, tenant: data.tenant, userType, role });

      return { userData, role, token };
    } catch (error: any) {
      // Clear any existing auth data on error (but don't call logout API)
      tokenStorage.remove();
      userStorage.remove();
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userRole');
      
      // Handle specific error cases
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

  /**
   * Get current user data by validating token
   * Used on app startup to restore session
   */
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
      
      // Determine user role based on userType and user data
      let role: UserRole;
      let userData: User | Tenant;

      if (userType === 'user' && data.user) {
        role = data.user.role; // 'admin' or 'staff'
        userData = data.user;
      } else if (userType === 'tenant' && data.tenant) {
        role = 'tenant';
        userData = data.tenant;
      } else {
        throw new Error('Invalid user data received');
      }

      // Update stored user data
      userStorage.set({ user: data.user, tenant: data.tenant, userType, role });

      return { userData, role };
    } catch (error) {
      // Clear auth data on any error
      authService.logout();
      return null;
    }
  },

  /**
   * Logout user and clear all auth data
   */
  async logout(): Promise<void> {
    try {
      // Call backend logout endpoint
      await api.post('/auth/logout');
    } catch (error) {
      // Continue with logout even if backend call fails
      console.warn('Logout API call failed:', error);
    } finally {
      // Clear all local storage
      tokenStorage.remove();
      userStorage.remove();
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userRole');
    }
  },

  /**
   * Check if user is currently authenticated
   */
  isAuthenticated(): boolean {
    return !!tokenStorage.get();
  },

  /**
   * Get stored user role
   */
  getUserRole(): UserRole | null {
    const userData = userStorage.get();
    return userData?.role || null;
  },

  /**
   * Get stored user data
   */
  getUserData(): User | Tenant | null {
    const userData = userStorage.get();
    return userData?.user || userData?.tenant || null;
  },
};
