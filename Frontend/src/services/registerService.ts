import api from '../config/api';
import { RegisterStaffData, RegisterTenantData, RegisterResponse } from '../types';

/**
 * Registration service for creating staff and tenant accounts
 * Used by admin users to create new accounts
 */
export const registerService = {
  /**
   * Register a new staff user (admin or staff role)
   */
  async registerStaff(data: RegisterStaffData): Promise<RegisterResponse> {
    try {
      const response = await api.post<RegisterResponse>('/auth/register', data);
      return response.data;
    } catch (error: any) {
      // Handle specific error cases
      if (error.response?.status === 400) {
        if (error.response?.data?.message?.includes('Validation failed')) {
          throw new Error('Please check all fields and ensure they meet the requirements.');
        } else if (error.response?.data?.message?.includes('email')) {
          throw new Error('Please enter a valid email address.');
        } else if (error.response?.data?.message?.includes('password')) {
          throw new Error('Password must be at least 8 characters with uppercase, lowercase, and number.');
        } else if (error.response?.data?.message?.includes('name')) {
          throw new Error('Name must be 3-30 characters and contain only letters, numbers, and spaces.');
        } else {
          throw new Error('Invalid input. Please check all fields.');
        }
      } else if (error.response?.status === 409) {
        if (error.response?.data?.message?.includes('email')) {
          throw new Error('A user with this email already exists.');
        } else if (error.response?.data?.message?.includes('name')) {
          throw new Error('A user with this name already exists.');
        } else {
          throw new Error('User already exists with this information.');
        }
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Registration failed. Please try again.');
      }
    }
  },

  /**
   * Register a new tenant
   */
  async registerTenant(data: RegisterTenantData): Promise<RegisterResponse> {
    try {
      const response = await api.post<RegisterResponse>('/auth/tenant/register', data);
      return response.data;
    } catch (error: any) {
      // Handle specific error cases
      if (error.response?.status === 400) {
        if (error.response?.data?.message?.includes('Validation failed')) {
          throw new Error('Please check all fields and ensure they meet the requirements.');
        } else if (error.response?.data?.message?.includes('email')) {
          throw new Error('Please enter a valid email address.');
        } else if (error.response?.data?.message?.includes('password')) {
          throw new Error('Password must be at least 8 characters with uppercase, lowercase, and number.');
        } else if (error.response?.data?.message?.includes('firstName') || error.response?.data?.message?.includes('lastName')) {
          throw new Error('Name must be 2-50 characters and contain only letters and spaces.');
        } else if (error.response?.data?.message?.includes('phoneNumber')) {
          throw new Error('Please enter a valid phone number (10-15 digits).');
        } else if (error.response?.data?.message?.includes('dateOfBirth')) {
          throw new Error('Tenant must be at least 18 years old.');
        } else if (error.response?.data?.message?.includes('idType')) {
          throw new Error('Please select a valid ID type.');
        } else if (error.response?.data?.message?.includes('emergencyContact')) {
          throw new Error('Please provide complete emergency contact information.');
        } else {
          throw new Error('Invalid input. Please check all fields.');
        }
      } else if (error.response?.status === 409) {
        throw new Error('A tenant with this email already exists.');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Registration failed. Please try again.');
      }
    }
  }
};
