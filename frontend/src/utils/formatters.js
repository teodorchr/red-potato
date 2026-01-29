import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { ro } from 'date-fns/locale';

/**
 * Format a date in DD.MM.YYYY format
 */
export const formatDate = (date) => {
  if (!date) return '-';
  try {
    return format(parseISO(date), 'dd.MM.yyyy', { locale: ro });
  } catch (error) {
    return '-';
  }
};

/**
 * Format a date in DD.MM.YYYY HH:mm format
 */
export const formatDateTime = (date) => {
  if (!date) return '-';
  try {
    return format(parseISO(date), 'dd.MM.yyyy HH:mm', { locale: ro });
  } catch (error) {
    return '-';
  }
};

/**
 * Format the relative distance to a date
 */
export const formatRelativeTime = (date) => {
  if (!date) return '-';
  try {
    return formatDistanceToNow(parseISO(date), {
      addSuffix: true,
      locale: ro,
    });
  } catch (error) {
    return '-';
  }
};

/**
 * Format a phone number
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '-';

  // Replace +40 with 0
  if (phone.startsWith('+40')) {
    phone = '0' + phone.substring(3);
  }

  // Format: 0722 123 456
  if (phone.length === 10 && phone.startsWith('0')) {
    return `${phone.substring(0, 4)} ${phone.substring(4, 7)} ${phone.substring(7)}`;
  }

  return phone;
};

/**
 * Format a license plate number
 */
export const formatPlateNumber = (plate) => {
  if (!plate) return '-';
  return plate.toUpperCase();
};

/**
 * Determine CSS class for days remaining badge
 */
export const getDaysRemainingClass = (days) => {
  if (days < 0) return 'badge-danger';
  if (days <= 3) return 'badge-danger';
  if (days <= 7) return 'badge-warning';
  return 'badge-success';
};

/**
 * Generate text for days remaining
 */
export const getDaysRemainingText = (days) => {
  if (days < 0) {
    const expired = Math.abs(days);
    return `Expired ${expired} ${expired === 1 ? 'day' : 'days'} ago`;
  }
  if (days === 0) return 'Expires today';
  if (days === 1) return 'Expires tomorrow';
  return `${days} days`;
};

/**
 * Format notification status
 */
export const formatNotificationStatus = (status) => {
  const statusMap = {
    sent: 'Sent',
    failed: 'Failed',
    pending: 'Pending',
  };
  return statusMap[status] || status;
};

/**
 * Determine CSS class for notification status
 */
export const getNotificationStatusClass = (status) => {
  const classMap = {
    sent: 'badge-success',
    failed: 'badge-danger',
    pending: 'badge-warning',
  };
  return classMap[status] || 'badge-info';
};

/**
 * Format notification type
 */
export const formatNotificationType = (type) => {
  const typeMap = {
    SMS: 'SMS',
    EMAIL: 'Email',
    BOTH: 'SMS & Email',
  };
  return typeMap[type] || type;
};
