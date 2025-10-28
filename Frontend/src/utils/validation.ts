// Phone number validation
export const formatPhoneNumber = (value: string): string => {
  // Always ensure we start with +63
  const prefix = '+63';
  
  // Remove all non-numeric characters
  let cleaned = value.replace(/[^\d]/g, '');
  
  // If user typed digits starting with 0 (like 0917...), remove the 0
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.slice(1);
  }
  
  // If the value already started with +63, extract only the digits after it
  if (value.startsWith('+63')) {
    cleaned = value.slice(3).replace(/[^\d]/g, '');
  }
  
  // Limit to 10 digits after +63
  const limitedDigits = cleaned.slice(0, 10);
  
  // Always return with +63 prefix
  return prefix + (limitedDigits ? ' ' + limitedDigits : ' ');
};

export const validatePhoneNumber = (phone: string): boolean => {
  // Expect exactly +63 followed by 10 digits
  const normalized = phone.replace(/\s/g, '');
  const pattern = /^\+63\d{10}$/;
  return pattern.test(normalized);
};

// Email validation for @gmail.com
export const validateEmail = (email: string): boolean => {
  return email.toLowerCase().endsWith('@gmail.com');
};

export const getPhoneError = (phone: string): string | undefined => {
  if (!phone || phone.trim() === '+63') return 'Phone number is required';
  if (!validatePhoneNumber(phone)) return 'Phone number must start with +63 followed by 10 digits';
  return undefined;
};

export const getEmailError = (email: string): string | undefined => {
  if (!email) return 'Email is required';
  if (!validateEmail(email)) return 'Only @gmail.com email addresses are allowed';
  return undefined;
};