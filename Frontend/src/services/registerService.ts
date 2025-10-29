import api from '../config/api';
import { RegisterStaffData, RegisterTenantData, RegisterResponse } from '../types';

export const registerService = {
  async registerStaff(data: RegisterStaffData): Promise<RegisterResponse> {
    try {
      const response = await api.post<RegisterResponse>('/auth/register', data);
      return response.data;
    } catch (error: any) {
      const serverMessage = error.response?.data?.message;
      const serverDetails = error.response?.data?.details || error.response?.data?.errors || null;
      if (serverDetails) console.warn('RegisterStaff server details:', serverDetails);

      let friendly = 'Registration failed. Please try again.';

      if (error.response?.status === 400) {
        if (serverMessage?.includes('Validation failed')) {
          friendly = 'Please check all fields and ensure they meet the requirements.';
        } else if (serverMessage?.includes('email')) {
          friendly = 'Please enter a valid email address.';
        } else if (serverMessage?.includes('password')) {
          friendly = 'Password must be at least 8 characters with uppercase, lowercase, and number.';
        } else if (serverMessage?.includes('name')) {
          friendly = 'Name must be 3-30 characters and contain only letters, numbers, and spaces.';
        } else {
          friendly = 'Invalid input. Please check all fields.';
        }
      } else if (error.response?.status === 409) {
        if (serverMessage?.includes('email')) {
          friendly = 'A user with this email already exists.';
        } else if (serverMessage?.includes('name')) {
          friendly = 'A user with this name already exists.';
        } else {
          friendly = 'User already exists with this information.';
        }
      } else if (serverMessage) {
        friendly = serverMessage;
      } else if (error.message) {
        friendly = error.message;
      }

      const thrown: any = new Error(friendly);
      if (serverDetails) thrown.details = serverDetails;
      if (error.response?.data) thrown.serverResponse = error.response.data;
      throw thrown;
    }
  },

  async registerTenant(data: RegisterTenantData): Promise<RegisterResponse> {
    try {
      const response = await api.post<RegisterResponse>('/auth/tenant/register', data);
      return response.data;
    } catch (error: any) {
      const serverMessage = error.response?.data?.message;
      const serverDetails = error.response?.data?.details || error.response?.data?.errors || null;
      if (serverDetails) console.warn('RegisterTenant server details:', serverDetails);

      let friendly = 'Registration failed. Please try again.';

      if (error.response?.status === 400) {
        if (serverMessage?.includes('Validation failed')) {
          friendly = 'Please check all fields and ensure they meet the requirements.';
        } else if (serverMessage?.includes('email')) {
          friendly = 'Please enter a valid email address.';
        } else if (serverMessage?.includes('password')) {
          friendly = 'Password must be at least 8 characters with uppercase, lowercase, and number.';
        } else if (serverMessage?.includes('firstName') || serverMessage?.includes('lastName')) {
          friendly = 'Name must be 2-50 characters and contain only letters and spaces.';
        } else if (serverMessage?.includes('phoneNumber')) {
          friendly = 'Please enter a valid phone number (10-15 digits).';
        } else if (serverMessage?.includes('dateOfBirth')) {
          friendly = 'Tenant must be at least 18 years old.';
        } else if (serverMessage?.includes('idType')) {
          friendly = 'Please select a valid ID type.';
        } else if (serverMessage?.includes('emergencyContact')) {
          friendly = 'Please provide complete emergency contact information.';
        } else {
          friendly = 'Invalid input. Please check all fields.';
        }
      } else if (error.response?.status === 409) {
        friendly = 'A tenant with this email already exists.';
      } else if (serverMessage) {
        friendly = serverMessage;
      } else if (error.message) {
        friendly = error.message;
      }

      const thrown: any = new Error(friendly);
      if (serverDetails) thrown.details = serverDetails;
      if (error.response?.data) thrown.serverResponse = error.response.data;
      throw thrown;
    }
  }
};