/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate Romanian phone number
 */
export const isValidPhoneNumber = (phone) => {
  // Allows formats: 0722123456, +40722123456, 0040722123456
  const phoneRegex = /^(\+4|0040|0)[0-9]{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Validate Romanian license plate number
 */
export const isValidPlateNumber = (plate) => {
  // Format: B-123-ABC or B-12-ABC
  const plateRegex = /^[A-Z]{1,2}-\d{2,3}-[A-Z]{3}$/;
  return plateRegex.test(plate.toUpperCase());
};

/**
 * Validate future date
 */
export const isFutureDate = (date) => {
  return new Date(date) > new Date();
};

/**
 * Normalize phone number (adds +40 prefix if missing)
 */
export const normalizePhoneNumber = (phone) => {
  phone = phone.replace(/\s/g, '');

  if (phone.startsWith('0') && phone.length === 10) {
    return '+4' + phone;
  }

  if (phone.startsWith('40') && phone.length === 11) {
    return '+' + phone;
  }

  if (phone.startsWith('+40') && phone.length === 12) {
    return phone;
  }

  return phone;
};

/**
 * Normalize license plate number (uppercase)
 */
export const normalizePlateNumber = (plate) => {
  return plate.toUpperCase().trim();
};

/**
 * Validate client form
 */
export const validateClientForm = (data) => {
  const errors = {};

  if (!data.name || data.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters long';
  }

  if (!data.licensePlate) {
    errors.licensePlate = 'License plate number is required';
  } else if (!isValidPlateNumber(data.licensePlate)) {
    errors.licensePlate = 'Invalid format (ex: B-123-ABC)';
  }

  if (!data.phoneNumber) {
    errors.phoneNumber = 'Phone number is required';
  } else if (!isValidPhoneNumber(data.phoneNumber)) {
    errors.phoneNumber = 'Invalid phone number';
  }

  if (!data.email) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Invalid email';
  }

  if (!data.itpExpirationDate) {
    errors.itpExpirationDate = 'ITP expiration date is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export default {
  isValidEmail,
  isValidPhoneNumber,
  isValidPlateNumber,
  isFutureDate,
  normalizePhoneNumber,
  normalizePlateNumber,
  validateClientForm,
};
