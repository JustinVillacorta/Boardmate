export const isEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export const sanitizeDigits = (value: string): string => value.replace(/\D/g, '');

export const isPHPhone = (value: string): boolean => /^\+63\d{10}$/.test(value);

export const withPH = (digits10: string): string => `+63${digits10}`;

export type ErrorMap = Record<string, string>;

export function getPHPhoneError(value: string, requiredMessage = 'Phone is required'): string | '' {
  const trimmed = (value || '').trim();
  if (!trimmed) return requiredMessage;
  if (!trimmed.startsWith('+63')) return 'Phone must start with +63';
  const rest = trimmed.slice(3);
  if (/\D/.test(rest)) return 'Only digits allowed after +63';
  if (rest.length < 10) return `Enter 10 digits after +63 (need ${10 - rest.length} more)`;
  if (rest.length > 10) return 'Enter exactly 10 digits after +63';
  return '';
}

// Users - Create
export function validateCreateUser(form: any): ErrorMap {
  const errors: ErrorMap = {};

  if (!form.firstName?.trim()) errors.firstName = 'First name is required';
  if (!form.lastName?.trim()) errors.lastName = 'Last name is required';
  if (!form.email?.trim()) errors.email = 'Email is required';
  else if (!isEmail(form.email)) errors.email = 'Please enter a valid email address';
  if (!form.username?.trim()) errors.username = 'Username is required';

  if (!form.password?.trim()) errors.password = 'Password is required';
  else {
    const unmet: string[] = [];
    if (form.password.length < 8) unmet.push('at least 8 characters');
    if (!/[a-z]/.test(form.password)) unmet.push('a lowercase letter');
    if (!/[A-Z]/.test(form.password)) unmet.push('an uppercase letter');
    if (!/\d/.test(form.password)) unmet.push('a number');
    if (unmet.length) errors.password = `Password must include ${unmet.join(', ')}`;
  }
  if (form.password !== form.confirmPassword) errors.confirmPassword = 'Passwords do not match';

  if (form.role === 'Tenant') {
    if (!form.dateOfBirth?.trim()) errors.dateOfBirth = 'Date of birth is required';
    else {
      const today = new Date();
      const dob = new Date(form.dateOfBirth);
      if (isNaN(dob.valueOf())) {
        errors.dateOfBirth = 'Please enter a valid date of birth';
      } else if (dob > today) {
        errors.dateOfBirth = 'Date of birth cannot be in the future';
      } else {
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
        if (age < 16) errors.dateOfBirth = 'Tenant must be at least 16 years old (16+)';
      }
    }

    {
      const msg = getPHPhoneError(form.phoneNumber, 'Phone is required');
      if (msg) errors.phoneNumber = msg;
    }

    if (!form.idType) errors.idType = 'ID type is required';
    if (!form.idNumber?.trim()) errors.idNumber = 'ID number is required';

    if (!form.contactName?.trim()) errors.contactName = 'Emergency contact name is required';
    {
      const msg2 = getPHPhoneError(form.contactPhone, 'Emergency contact phone is required');
      if (msg2) errors.contactPhone = msg2;
    }
  }

  return errors;
}

// Users - Edit
export function validateEditUser(form: any, role: 'Staff' | 'Tenant' | 'Admin'): ErrorMap {
  const errors: ErrorMap = {};

  if (role === 'Staff' || role === 'Admin') {
    if (form.name?.trim() && form.name.trim().length < 2) errors.name = 'Name must be at least 2 characters';
    if (form.email?.trim() && !isEmail(form.email)) errors.email = 'Please enter a valid email address';
    if (!form.name?.trim() && !form.email?.trim()) errors.general = 'Please provide at least one field to update';
  } else {
    if (!form.firstName?.trim()) errors.firstName = 'First name is required';
    if (!form.lastName?.trim()) errors.lastName = 'Last name is required';
    if (!form.email?.trim()) errors.email = 'Email is required';
    else if (!isEmail(form.email)) errors.email = 'Please enter a valid email address';
    {
      const msg = getPHPhoneError(form.phoneNumber, 'Phone number is required');
      if (msg) errors.phoneNumber = msg;
    }
    if (!form.emergencyContact?.name?.trim()) errors.emergencyContactName = 'Emergency contact name is required';
    {
      const msg2 = getPHPhoneError(form.emergencyContact?.phoneNumber, 'Emergency contact phone is required');
      if (msg2) errors.emergencyContactPhone = msg2;
    }
  }

  return errors;
}

// Rooms (create/edit)
export function validateRoom(form: any): ErrorMap {
  const errors: ErrorMap = {};
  if (!form.roomNumber) errors.roomNumber = 'Room number is required';
  if (form.capacity !== undefined && (!Number.isInteger(form.capacity) || form.capacity < 1)) {
    errors.capacity = 'Capacity must be an integer greater than 0';
  }
  if (!form.monthlyRent) errors.monthlyRent = 'Monthly rent is required';
  else {
    const amt = parseFloat(String(form.monthlyRent).replace(/[^\d.]/g, ''));
    if (isNaN(amt) || amt <= 0) errors.monthlyRent = 'Enter a positive number (e.g., 1000 or 1000.50)';
  }
  if (form.securityDeposit) {
    const dep = parseFloat(String(form.securityDeposit).replace(/[^\d.]/g, ''));
    if (isNaN(dep) || dep < 0) errors.securityDeposit = 'Enter a non-negative number';
  }
  if (form.floor !== '' && form.floor !== undefined && (isNaN(parseInt(String(form.floor))) || parseInt(String(form.floor)) < 0)) errors.floor = 'Floor must be an integer ≥ 0';
  if (form.area !== '' && form.area !== undefined && isNaN(parseFloat(String(form.area)))) errors.area = 'Please enter a valid area';
  return errors;
}


