const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STAFF_NAME_REGEX = /^[a-zA-Z0-9\s]+$/;
const PERSON_NAME_REGEX = /^[a-zA-Z\s]+$/;
const PASSWORD_COMPLEXITY_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
const ROOM_NUMBER_REGEX = /^[a-zA-Z0-9\-]+$/;
const PHONE_REGEX = /^[\+]?\d{10,15}$/;
const MONGO_ID_REGEX = /^[a-f\d]{24}$/i;

const ANNOUNCEMENT_AUDIENCES = new Set(['all', 'tenants', 'staff', 'admins', 'custom']);
const ANNOUNCEMENT_PRIORITIES = new Set(['low', 'medium', 'high', 'urgent']);
const PAYMENT_TYPES = new Set(['rent', 'deposit', 'utility', 'maintenance', 'penalty', 'other']);
const PAYMENT_METHODS = new Set(['cash', 'bank_transfer', 'check', 'credit_card', 'debit_card', 'digital_wallet', 'money_order']);
const PAYMENT_STATUSES = new Set(['paid', 'pending', 'overdue']);
const REPORT_TYPES = new Set(['maintenance', 'complaint', 'other']);
const REPORT_STATUSES = new Set(['pending', 'in-progress', 'resolved', 'rejected']);
const ID_TYPES = new Set(['passport', 'drivers_license', 'national_id', 'other']);
const ROOM_TYPES = new Set(['single', 'double', 'triple', 'quad']);
const ROOM_STATUSES = new Set(['available', 'occupied', 'maintenance', 'unavailable']);

const ID_TYPE_ALIASES: Record<string, string> = {
  'national id': 'national_id',
  "driver's license": 'drivers_license',
  'drivers license': 'drivers_license',
  'passport': 'passport',
  'sss id': 'other',
  'philhealth id': 'other',
  'tin id': 'other',
};

type ErrorMap = Record<string, string>;

const ensureString = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (value === undefined || value === null) return '';
  return String(value);
};

const isEmpty = (value: unknown): boolean => {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  return false;
};

const isValidDate = (value: unknown): boolean => {
  if (value === undefined || value === null || value === '') return false;
  const parsed = Date.parse(String(value));
  return Number.isFinite(parsed);
};

const toNumber = (value: unknown): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const normalized = value.trim();
    if (!normalized) return Number.NaN;
    const numeric = Number(normalized);
    return Number.isNaN(numeric) ? Number.NaN : numeric;
  }
  return Number.NaN;
};

const toInteger = (value: unknown): number => {
  const num = toNumber(value);
  return Number.isInteger(num) ? num : Number.NaN;
};

const toFloat = (value: unknown): number => {
  const num = toNumber(value);
  return Number.isNaN(num) ? Number.NaN : num;
};

const isBooleanLike = (value: unknown): boolean => typeof value === 'boolean';

const isValidUrl = (value: string): boolean => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

export const isEmail = (value: string): boolean => EMAIL_REGEX.test(value);

export const sanitizeDigits = (value: string): string => value.replace(/\D/g, '');

export const isPHPhone = (value: string): boolean => /^\+63\d{10}$/.test(value);

export const withPH = (digits10: string): string => `+63${digits10}`;

export function getPHPhoneError(value: string, requiredMessage = 'Phone is required'): string | '' {
  const trimmed = ensureString(value).trim();
  if (!trimmed) return requiredMessage;
  if (!PHONE_REGEX.test(trimmed)) return 'Please provide a valid phone number (10-15 digits)';
  return '';
}

const validatePassword = (password: string): string | undefined => {
  const trimmed = ensureString(password);
  if (!trimmed) return 'Password is required';
  if (trimmed.length < 6) return 'Password must be at least 6 characters long';
  if (!PASSWORD_COMPLEXITY_REGEX.test(trimmed)) return 'Password must contain at least one lowercase letter, one uppercase letter, and one number';
  return undefined;
};

export function validateCreateUser(form: any): ErrorMap {
  const errors: ErrorMap = {};
  const role = ensureString(form.role) || 'Tenant';

  const email = ensureString(form.email).trim();
  if (!email) errors.email = 'Email is required';
  else if (!isEmail(email)) errors.email = 'Please provide a valid email address';

  const passwordError = validatePassword(form.password);
  if (passwordError) errors.password = passwordError;

  if (ensureString(form.confirmPassword) !== ensureString(form.password)) {
    errors.confirmPassword = 'Passwords do not match';
  }

  if (!ensureString(form.username).trim()) {
    errors.username = 'Username is required';
  }

  const firstName = ensureString(form.firstName).trim();
  const lastName = ensureString(form.lastName).trim();

  if (!firstName) errors.firstName = 'First name is required';
  else {
    if (firstName.length < 2 || firstName.length > 50) errors.firstName = 'First name must be between 2 and 50 characters';
    else if (!PERSON_NAME_REGEX.test(firstName)) errors.firstName = 'First name can only contain letters and spaces';
  }

  if (!lastName) errors.lastName = 'Last name is required';
  else {
    if (lastName.length < 2 || lastName.length > 50) errors.lastName = 'Last name must be between 2 and 50 characters';
    else if (!PERSON_NAME_REGEX.test(lastName)) errors.lastName = 'Last name can only contain letters and spaces';
  }

  if (role === 'Tenant') {
    const dateOfBirth = ensureString(form.dateOfBirth).trim();
    if (!dateOfBirth) errors.dateOfBirth = 'Date of birth is required';
    else if (!isValidDate(dateOfBirth)) {
      errors.dateOfBirth = 'Please provide a valid date of birth';
    } else {
      const today = new Date();
      const dob = new Date(dateOfBirth);
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) age--;
      if (age < 16) errors.dateOfBirth = 'Tenant must be at least 16 years old';
      if (dob > today) errors.dateOfBirth = 'Date of birth cannot be in the future';
    }

    const phoneError = getPHPhoneError(form.phoneNumber, 'Phone is required');
    if (phoneError) errors.phoneNumber = phoneError;

    const idTypeRaw = ensureString(form.idType).trim();
    const normalizedIdType = ID_TYPE_ALIASES[idTypeRaw.toLowerCase()] ?? idTypeRaw.toLowerCase();
    if (!ID_TYPES.has(normalizedIdType as any)) {
      errors.idType = 'ID type must be one of: passport, drivers_license, national_id, or other';
    }

    const idNumber = ensureString(form.idNumber).trim();
    if (!idNumber) errors.idNumber = 'ID number is required and must not exceed 50 characters';
    else if (idNumber.length > 50) errors.idNumber = 'ID number is required and must not exceed 50 characters';

    const occupation = ensureString(form.occupation).trim();
    if (occupation && occupation.length > 100) errors.occupation = 'Occupation must not exceed 100 characters';

    const street = ensureString(form.street).trim();
    if (street && street.length > 100) errors.street = 'Street address must not exceed 100 characters';

    const city = ensureString(form.city).trim();
    if (city && city.length > 50) errors.city = 'City must not exceed 50 characters';

    const province = ensureString(form.province).trim();
    if (province && province.length > 50) errors.province = 'Province must not exceed 50 characters';

    const zipCode = ensureString(form.zipCode).trim();
    if (zipCode && zipCode.length > 10) errors.zipCode = 'Zip code must not exceed 10 characters';

    const contactName = ensureString(form.contactName).trim();
    if (!contactName) errors.contactName = 'Emergency contact name must be between 2 and 100 characters';
    else {
      if (contactName.length < 2 || contactName.length > 100) errors.contactName = 'Emergency contact name must be between 2 and 100 characters';
      else if (!PERSON_NAME_REGEX.test(contactName)) errors.contactName = 'Emergency contact name can only contain letters and spaces';
    }

    const relationship = ensureString(form.relationship).trim();
    if (!relationship) errors.relationship = 'Emergency contact relationship must be between 2 and 50 characters';
    else if (relationship.length < 2 || relationship.length > 50) errors.relationship = 'Emergency contact relationship must be between 2 and 50 characters';

    const contactPhoneError = getPHPhoneError(form.contactPhone, 'Emergency contact phone is required');
    if (contactPhoneError) errors.contactPhone = contactPhoneError;
  } else {
    const combinedName = `${firstName} ${lastName}`.trim();
    if (combinedName.length < 3 || combinedName.length > 30) {
      errors.firstName = 'Name must be between 3 and 30 characters';
    } else if (!STAFF_NAME_REGEX.test(combinedName)) {
      errors.firstName = 'Name can only contain letters, numbers, and spaces';
    }
  }

  return errors;
}

export function validateEditUser(form: any, role: 'Staff' | 'Tenant' | 'Admin'): ErrorMap {
  const errors: ErrorMap = {};

  if (role === 'Staff' || role === 'Admin') {
    const name = ensureString(form.name).trim();
    if (name) {
      if (name.length < 3 || name.length > 30) errors.name = 'Name must be between 3 and 30 characters';
      else if (!STAFF_NAME_REGEX.test(name)) errors.name = 'Name can only contain letters, numbers, and spaces';
    }
    const email = ensureString(form.email).trim();
    if (email && !isEmail(email)) errors.email = 'Please provide a valid email address';
    if (!name && !email) errors.general = 'Please provide at least one field to update';
  } else {
    const firstName = ensureString(form.firstName).trim();
    if (!firstName) {
      errors.firstName = 'First name is required';
    } else {
      if (firstName.length < 2 || firstName.length > 50) errors.firstName = 'First name must be between 2 and 50 characters';
      else if (!PERSON_NAME_REGEX.test(firstName)) errors.firstName = 'First name can only contain letters and spaces';
    }

    const lastName = ensureString(form.lastName).trim();
    if (!lastName) {
      errors.lastName = 'Last name is required';
    } else {
      if (lastName.length < 2 || lastName.length > 50) errors.lastName = 'Last name must be between 2 and 50 characters';
      else if (!PERSON_NAME_REGEX.test(lastName)) errors.lastName = 'Last name can only contain letters and spaces';
    }

    const email = ensureString(form.email).trim();
    if (!email) errors.email = 'Email is required';
    else if (!isEmail(email)) errors.email = 'Please provide a valid email address';

    const phone = ensureString(form.phoneNumber).trim();
    if (phone) {
      const phoneError = getPHPhoneError(phone, 'Phone number is required');
      if (phoneError) errors.phoneNumber = phoneError;
    }

    const occupation = ensureString(form.occupation).trim();
    if (occupation && occupation.length > 100) errors.occupation = 'Occupation must not exceed 100 characters';

    const street = ensureString(form.address?.street ?? form.street).trim();
    if (street && street.length > 100) errors.street = 'Street address must not exceed 100 characters';

    const city = ensureString(form.address?.city ?? form.city).trim();
    if (city && city.length > 50) errors.city = 'City must not exceed 50 characters';

    const province = ensureString(form.address?.province ?? form.province).trim();
    if (province && province.length > 50) errors.province = 'Province must not exceed 50 characters';

    const zipCode = ensureString(form.address?.zipCode ?? form.zipCode).trim();
    if (zipCode && zipCode.length > 10) errors.zipCode = 'Zip code must not exceed 10 characters';

    const emergencyContact = form.emergencyContact || {};
    const contactName = ensureString(emergencyContact.name ?? form.emergencyContactName).trim();
    if (contactName) {
      if (contactName.length < 2 || contactName.length > 100) errors.emergencyContactName = 'Emergency contact name must be between 2 and 100 characters';
      else if (!PERSON_NAME_REGEX.test(contactName)) errors.emergencyContactName = 'Emergency contact name can only contain letters and spaces';
    }

    const relationship = ensureString(emergencyContact.relationship ?? form.relationship).trim();
    if (relationship && (relationship.length < 2 || relationship.length > 50)) {
      errors.emergencyContactRelationship = 'Emergency contact relationship must be between 2 and 50 characters';
    }

    const contactPhone = ensureString(emergencyContact.phoneNumber ?? form.emergencyContact?.phoneNumber ?? form.emergencyContactPhone).trim();
    if (contactPhone) {
      const contactPhoneError = getPHPhoneError(contactPhone, 'Emergency contact phone is required');
      if (contactPhoneError) errors.emergencyContactPhone = contactPhoneError;
    }
  }

  return errors;
}

export function validateRoom(form: any, options: { isUpdate?: boolean } = {}): ErrorMap {
  const { isUpdate = false } = options;
  const errors: ErrorMap = {};

  const roomNumber = ensureString(form.roomNumber).trim();
  if (!isUpdate || roomNumber) {
    if (!roomNumber) errors.roomNumber = 'Room number is required and must not exceed 10 characters';
    else {
      if (roomNumber.length > 10) errors.roomNumber = 'Room number is required and must not exceed 10 characters';
      else if (!ROOM_NUMBER_REGEX.test(roomNumber)) errors.roomNumber = 'Room number can only contain letters, numbers, and hyphens';
    }
  }

  const roomType = ensureString(form.roomType).trim();
  if (!isUpdate || roomType) {
    if (!ROOM_TYPES.has(roomType as any)) errors.roomType = 'Room type must be one of: single, double, triple, quad';
  }

  const capacity = form.capacity;
  if (!isUpdate || (capacity !== undefined && capacity !== null && String(capacity).trim() !== '')) {
    const intCapacity = toInteger(capacity);
    if (Number.isNaN(intCapacity) || intCapacity < 1 || intCapacity > 4) {
      errors.capacity = 'Capacity must be between 1 and 4';
    }
  }

  const monthlyRentRaw = form.monthlyRent;
  if (!isUpdate || !isEmpty(monthlyRentRaw)) {
    const monthlyRent = toFloat(monthlyRentRaw);
    if (!Number.isFinite(monthlyRent) || monthlyRent < 0) {
      errors.monthlyRent = 'Monthly rent must be a positive number';
    }
  }

  const securityDepositRaw = form.securityDeposit;
  if (!isEmpty(securityDepositRaw)) {
    const securityDeposit = toFloat(securityDepositRaw);
    if (!Number.isFinite(securityDeposit) || securityDeposit < 0) {
      errors.securityDeposit = 'Security deposit must be a positive number';
    }
  }

  const description = ensureString(form.description).trim();
  if (description && description.length > 500) errors.description = 'Description must not exceed 500 characters';

  if (!isEmpty(form.amenities)) {
    if (!Array.isArray(form.amenities)) {
      errors.amenities = 'Amenities must be an array';
    } else {
      form.amenities.forEach((item: any, idx: number) => {
        const amenity = ensureString(item).trim();
        if (!amenity) errors[`amenities.${idx}`] = 'Each amenity must be between 1 and 50 characters';
        else if (amenity.length < 1 || amenity.length > 50) errors[`amenities.${idx}`] = 'Each amenity must be between 1 and 50 characters';
      });
    }
  }

  const floorRaw = form.floor;
  if (!isEmpty(floorRaw)) {
    const floor = toInteger(floorRaw);
    if (!Number.isFinite(floor) || floor < 0) errors.floor = 'Floor must be a non-negative integer';
  }

  const areaRaw = form.area;
  if (!isEmpty(areaRaw)) {
    const area = toFloat(areaRaw);
    if (!Number.isFinite(area) || area < 1) errors.area = 'Area must be a positive number';
  }

  const status = ensureString(form.status).trim();
  if (!isEmpty(status)) {
    if (!ROOM_STATUSES.has(status as any)) errors.status = 'Status must be one of: available, occupied, maintenance, unavailable';
  }

  if (!isEmpty(form.images)) {
    if (!Array.isArray(form.images)) errors.images = 'Images must be an array';
    else {
      form.images.forEach((img: any, idx: number) => {
        const url = ensureString(img).trim();
        if (url && !isValidUrl(url)) errors[`images.${idx}`] = 'Each image must be a valid URL';
      });
    }
  }

  const notes = ensureString(form.notes).trim();
  if (notes && notes.length > 1000) errors.notes = 'Notes must not exceed 1000 characters';

  const nextMaintenanceDate = ensureString(form.nextMaintenanceDate).trim();
  if (nextMaintenanceDate && !isValidDate(nextMaintenanceDate)) {
    errors.nextMaintenanceDate = 'Next maintenance date must be a valid date';
  }

  return errors;
}

export function validateAnnouncementCreate(form: any): ErrorMap {
  const errors: ErrorMap = {};

  const title = ensureString(form.title).trim();
  if (!title || title.length < 3 || title.length > 200) {
    errors.title = 'Title must be between 3 and 200 characters';
  }

  const content = ensureString(form.content).trim();
  if (!content || content.length < 10 || content.length > 5000) {
    errors.content = 'Content must be between 10 and 5000 characters';
  }

  const audience = ensureString(form.audience).trim();
  if (audience && !ANNOUNCEMENT_AUDIENCES.has(audience as any)) {
    errors.audience = 'Audience must be one of: all, tenants, staff, admins, custom';
  }

  const priority = ensureString(form.priority).trim();
  if (priority && !ANNOUNCEMENT_PRIORITIES.has(priority as any)) {
    errors.priority = 'Priority must be one of: low, medium, high, urgent';
  }

  const publishDate = ensureString(form.publishDate).trim();
  if (publishDate && !isValidDate(publishDate)) {
    errors.publishDate = 'Publish date must be a valid date';
  }

  if (!isEmpty(form.targetUsers)) {
    if (!Array.isArray(form.targetUsers)) {
      errors.targetUsers = 'Target users must be an array';
    } else {
      form.targetUsers.forEach((item: any, idx: number) => {
        const userId = ensureString(item?.user).trim();
        if (userId && !MONGO_ID_REGEX.test(userId)) {
          errors[`targetUsers.${idx}.user`] = 'Each target user ID must be a valid MongoDB ObjectId';
        }
        const model = ensureString(item?.userModel).trim();
        if (model && model !== 'User' && model !== 'Tenant') {
          errors[`targetUsers.${idx}.userModel`] = 'User model must be either User or Tenant';
        }
      });
    }
  }

  if (!isEmpty(form.targetRooms)) {
    if (!Array.isArray(form.targetRooms)) {
      errors.targetRooms = 'Target rooms must be an array';
    } else {
      form.targetRooms.forEach((roomId: any, idx: number) => {
        const value = ensureString(roomId).trim();
        if (value && !MONGO_ID_REGEX.test(value)) errors[`targetRooms.${idx}`] = 'Each target room ID must be a valid MongoDB ObjectId';
      });
    }
  }

  if (!isEmpty(form.attachments)) {
    if (!Array.isArray(form.attachments)) {
      errors.attachments = 'Attachments must be an array';
    } else {
      form.attachments.forEach((attachment: any, idx: number) => {
        const name = ensureString(attachment?.name).trim();
        if (name && (name.length < 1 || name.length > 255)) {
          errors[`attachments.${idx}.name`] = 'Attachment name must be between 1 and 255 characters';
        }
        const url = ensureString(attachment?.url).trim();
        if (url && !isValidUrl(url)) {
          errors[`attachments.${idx}.url`] = 'Attachment URL must be valid';
        }
      });
    }
  }

  return errors;
}

export function validateAnnouncementUpdate(form: any): ErrorMap {
  const errors: ErrorMap = {};
  const title = ensureString(form.title).trim();
  if (title && (title.length < 3 || title.length > 200)) {
    errors.title = 'Title must be between 3 and 200 characters';
  }

  const content = ensureString(form.content).trim();
  if (content && (content.length < 10 || content.length > 5000)) {
    errors.content = 'Content must be between 10 and 5000 characters';
  }

  const audience = ensureString(form.audience).trim();
  if (audience && !ANNOUNCEMENT_AUDIENCES.has(audience as any)) {
    errors.audience = 'Audience must be one of: all, tenants, staff, admins, custom';
  }

  const priority = ensureString(form.priority).trim();
  if (priority && !ANNOUNCEMENT_PRIORITIES.has(priority as any)) {
    errors.priority = 'Priority must be one of: low, medium, high, urgent';
  }

  const publishDate = ensureString(form.publishDate).trim();
  if (publishDate && !isValidDate(publishDate)) {
    errors.publishDate = 'Publish date must be a valid date';
  }

  if (!isEmpty(form.targetUsers)) {
    if (!Array.isArray(form.targetUsers)) errors.targetUsers = 'Target users must be an array';
  }

  if (!isEmpty(form.targetRooms)) {
    if (!Array.isArray(form.targetRooms)) errors.targetRooms = 'Target rooms must be an array';
  }

  if (!isEmpty(form.attachments)) {
    if (!Array.isArray(form.attachments)) errors.attachments = 'Attachments must be an array';
  }

  return errors;
}

export function validatePaymentCreate(form: any, options: { requireTenantRoom?: boolean } = {}): ErrorMap {
  const { requireTenantRoom = true } = options;
  const errors: ErrorMap = {};

  if (requireTenantRoom) {
    const tenant = ensureString(form.tenant).trim();
    if (!tenant || !MONGO_ID_REGEX.test(tenant)) errors.tenant = 'Valid tenant ID is required';

    const room = ensureString(form.room).trim();
    if (!room || !MONGO_ID_REGEX.test(room)) errors.room = 'Valid room ID is required';
  }

  const amount = toFloat(form.amount);
  if (!Number.isFinite(amount) || amount < 0) {
    errors.amount = 'Amount must be a positive number';
  }

  const paymentType = ensureString(form.paymentType).trim();
  if (!PAYMENT_TYPES.has(paymentType as any)) {
    errors.paymentType = 'Payment type must be one of: rent, deposit, utility, maintenance, penalty, other';
  }

  const paymentMethod = ensureString(form.paymentMethod).trim();
  if (!PAYMENT_METHODS.has(paymentMethod as any)) {
    errors.paymentMethod = 'Payment method must be one of: cash, bank_transfer, check, credit_card, debit_card, digital_wallet, money_order';
  }

  const paymentDate = ensureString(form.paymentDate).trim();
  if (paymentDate && !isValidDate(paymentDate)) {
    errors.paymentDate = 'Payment date must be a valid date';
  }

  const dueDate = ensureString(form.dueDate).trim();
  if (!dueDate || !isValidDate(dueDate)) {
    errors.dueDate = 'Due date is required and must be a valid date';
  }

  const status = ensureString(form.status).trim();
  if (status && !PAYMENT_STATUSES.has(status as any)) {
    errors.status = 'Status must be one of: paid, pending, overdue';
  }

  const periodCovered = form.periodCovered || {};
  const periodStart = ensureString(periodCovered.startDate).trim();
  if (periodStart && !isValidDate(periodStart)) {
    errors['periodCovered.startDate'] = 'Period start date must be a valid date';
  }

  const periodEnd = ensureString(periodCovered.endDate).trim();
  if (periodEnd && !isValidDate(periodEnd)) {
    errors['periodCovered.endDate'] = 'Period end date must be a valid date';
  }
  if (periodStart && periodEnd && isValidDate(periodStart) && isValidDate(periodEnd)) {
    if (new Date(periodEnd) <= new Date(periodStart)) {
      errors['periodCovered.endDate'] = 'Period end date must be after start date';
    }
  }

  const receiptNumber = ensureString(form.receiptNumber).trim();
  if (receiptNumber && (receiptNumber.length < 1 || receiptNumber.length > 50)) {
    errors.receiptNumber = 'Receipt number must be between 1 and 50 characters';
  }

  const transactionReference = ensureString(form.transactionReference).trim();
  if (transactionReference && (transactionReference.length < 1 || transactionReference.length > 100)) {
    errors.transactionReference = 'Transaction reference must be between 1 and 100 characters';
  }

  const description = ensureString(form.description).trim();
  if (description && description.length > 500) {
    errors.description = 'Description must not exceed 500 characters';
  }

  const notes = ensureString(form.notes).trim();
  if (notes && notes.length > 1000) {
    errors.notes = 'Notes must not exceed 1000 characters';
  }

  const lateFee = form.lateFee || {};
  if (lateFee.amount !== undefined) {
    const lateFeeAmount = toFloat(lateFee.amount);
    if (!Number.isFinite(lateFeeAmount) || lateFeeAmount < 0) {
      errors['lateFee.amount'] = 'Late fee amount must be a positive number';
    }
  }

  if (lateFee.reason !== undefined) {
    const reason = ensureString(lateFee.reason).trim();
    if (reason.length > 200) {
      errors['lateFee.reason'] = 'Late fee reason must not exceed 200 characters';
    }
  }

  if (lateFee.isLatePayment !== undefined && !isBooleanLike(lateFee.isLatePayment)) {
    errors['lateFee.isLatePayment'] = 'Late payment flag must be a boolean';
  }

  return errors;
}

export function validatePaymentUpdate(form: any): ErrorMap {
  return validatePaymentCreate(form, { requireTenantRoom: false });
}

export function validateMarkPaymentPaid(form: any): ErrorMap {
  const errors: ErrorMap = {};

  const transactionReference = ensureString(form.transactionReference).trim();
  if (transactionReference && (transactionReference.length < 1 || transactionReference.length > 100)) {
    errors.transactionReference = 'Transaction reference must be between 1 and 100 characters';
  }

  const notes = ensureString(form.notes).trim();
  if (notes && notes.length > 1000) {
    errors.notes = 'Notes must not exceed 1000 characters';
  }

  return errors;
}

export function validateReportCreate(form: any, options: { requireRoom?: boolean } = {}): ErrorMap {
  const { requireRoom = true } = options;
  const errors: ErrorMap = {};

  if (!isEmpty(form.tenant)) {
    const tenant = ensureString(form.tenant).trim();
    if (tenant && !MONGO_ID_REGEX.test(tenant)) errors.tenant = 'Valid tenant ID is required';
  }

  if (requireRoom) {
    const room = ensureString(form.room).trim();
    if (!room || !MONGO_ID_REGEX.test(room)) errors.room = 'Valid room ID is required';
  }

  const type = ensureString(form.type).trim();
  if (!REPORT_TYPES.has(type as any)) {
    errors.type = 'Type must be either maintenance or complaint';
  }

  const title = ensureString(form.title).trim();
  if (!title || title.length < 3 || title.length > 100) {
    errors.title = 'Title must be between 3 and 100 characters';
  }

  const description = ensureString(form.description).trim();
  if (!description || description.length < 10 || description.length > 1000) {
    errors.description = 'Description must be between 10 and 1000 characters';
  }

  return errors;
}

export function validateReportUpdate(form: any): ErrorMap {
  const errors: ErrorMap = {};
  const status = ensureString(form.status).trim();
  if (!REPORT_STATUSES.has(status as any)) {
    errors.status = 'Status must be one of: pending, in-progress, resolved, rejected';
  }
  return errors;
}

export function validatePasswordChange(form: any): ErrorMap {
  const errors: ErrorMap = {};
  const currentPassword = ensureString(form.currentPassword);
  if (!currentPassword.trim()) errors.currentPassword = 'Current password is required';

  const newPasswordError = validatePassword(form.newPassword);
  if (newPasswordError) errors.newPassword = newPasswordError;

  if (ensureString(form.confirmPassword) !== ensureString(form.newPassword)) {
    errors.confirmPassword = 'Password confirmation does not match new password';
  }
  return errors;
}

export function validateLoginForm(form: any): ErrorMap {
  const errors: ErrorMap = {};
  const email = ensureString(form.email).trim();
  if (!email || !isEmail(email)) errors.email = 'Please provide a valid email address';

  const password = ensureString(form.password);
  if (!password.trim()) errors.password = 'Password is required';
  return errors;
}

export function validateTenantAssignment(form: any): ErrorMap {
  const errors: ErrorMap = {};

  const tenantId = ensureString(form.tenantId).trim();
  if (!tenantId || !MONGO_ID_REGEX.test(tenantId)) errors.tenantId = 'Valid tenant ID is required';

  const leaseStart = ensureString(form.leaseStartDate).trim();
  if (!leaseStart || !isValidDate(leaseStart)) errors.leaseStartDate = 'Valid lease start date is required';

  const leaseEnd = ensureString(form.leaseEndDate).trim();
  if (leaseEnd && !isValidDate(leaseEnd)) errors.leaseEndDate = 'Lease end date must be a valid date';
  if (leaseEnd && leaseStart && isValidDate(leaseEnd) && isValidDate(leaseStart)) {
    if (new Date(leaseEnd) <= new Date(leaseStart)) errors.leaseEndDate = 'Lease end date must be after start date';
  }

  const monthlyRent = toFloat(form.monthlyRent);
  if (!Number.isNaN(monthlyRent) && monthlyRent < 0) errors.monthlyRent = 'Monthly rent must be a positive number';

  const securityDeposit = toFloat(form.securityDeposit);
  if (!Number.isNaN(securityDeposit) && securityDeposit < 0) {
    errors.securityDeposit = 'Security deposit must be a positive number';
  }

  const contractFile = ensureString(form.contractFile);
  if (!contractFile) {
    errors.contractFile = 'Contract file is required';
  } else {
    const base64Regex = /^data:application\/pdf;base64,/;
    if (!base64Regex.test(contractFile)) {
      errors.contractFile = 'Contract file must be a PDF file in base64 format';
    } else {
      const base64Data = contractFile.split(',')[1] || '';
      const sizeInBytes = (base64Data.length * 3) / 4;
      const maxSize = 10 * 1024 * 1024;
      if (sizeInBytes > maxSize) {
        errors.contractFile = 'Contract file size must not exceed 10MB';
      }
    }
  }

  const contractFileName = ensureString(form.contractFileName).trim();
  if (contractFileName) {
    if (contractFileName.length < 1 || contractFileName.length > 255) {
      errors.contractFileName = 'Contract file name must be between 1 and 255 characters';
    } else if (!/\.pdf$/i.test(contractFileName)) {
      errors.contractFileName = 'Contract file must have .pdf extension';
    }
  }

  return errors;
}

export function validateContractGeneration(form: any): ErrorMap {
  const errors: ErrorMap = {};

  const tenantId = ensureString(form.tenantId).trim();
  if (!tenantId || !MONGO_ID_REGEX.test(tenantId)) errors.tenantId = 'Valid tenant ID is required';

  const roomId = ensureString(form.roomId).trim();
  if (!roomId || !MONGO_ID_REGEX.test(roomId)) errors.roomId = 'Valid room ID is required';

  const duration = toInteger(form.leaseDurationMonths);
  if (!Number.isInteger(duration) || duration < 1 || duration > 60) {
    errors.leaseDurationMonths = 'Lease duration must be between 1 and 60 months';
  }

  const leaseStart = ensureString(form.leaseStartDate).trim();
  if (!leaseStart || !isValidDate(leaseStart)) errors.leaseStartDate = 'Lease start date is required and must be a valid date';

  const monthlyRent = toFloat(form.monthlyRent);
  if (!Number.isNaN(monthlyRent) && monthlyRent < 0) errors.monthlyRent = 'Monthly rent must be a positive number';

  const securityDeposit = toFloat(form.securityDeposit);
  if (!Number.isNaN(securityDeposit) && securityDeposit < 0) {
    errors.securityDeposit = 'Security deposit must be a positive number';
  }

  const landlordName = ensureString(form.landlordName).trim();
  if (!landlordName || landlordName.length < 3 || landlordName.length > 100) {
    errors.landlordName = 'Landlord name must be between 3 and 100 characters';
  }

  const landlordAddress = ensureString(form.landlordAddress).trim();
  if (!landlordAddress || landlordAddress.length < 10 || landlordAddress.length > 200) {
    errors.landlordAddress = 'Landlord address must be between 10 and 200 characters';
  }

  const specialTerms = ensureString(form.specialTerms).trim();
  if (specialTerms && specialTerms.length > 1000) {
    errors.specialTerms = 'Special terms must not exceed 1000 characters';
  }

  return errors;
}

export type { ErrorMap };
