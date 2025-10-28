export {
  validateRegister,
  validateLogin,
  validateUpdateDetails,
  validateUpdatePassword,
} from './validators/authValidators.js';

export {
  validateTenantRegister,
  validateTenantUpdateDetails,
  validateTenantUpdatePassword,
} from './validators/tenantValidators.js';

export {
  validateRoomCreate,
  validateRoomUpdate,
  validateTenantAssignment,
  validateContractGeneration,
} from './validators/roomValidators.js';

export {
  validatePaymentCreate,
  validatePaymentUpdate,
  validateMarkPaymentPaid,
} from './validators/paymentValidators.js';

export {
  validateReportCreate,
  validateReportUpdate,
} from './validators/reportValidators.js';

export {
  validateAnnouncementCreate,
  validateAnnouncementUpdate,
} from './validators/announcementValidators.js';