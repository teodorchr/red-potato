import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { ro, enUS, fr } from 'date-fns/locale';
import i18n from '../i18n';

const locales = { ro, en: enUS, fr };

const getLocale = () => locales[i18n.language] || ro;

/**
 * Format a date in DD.MM.YYYY format
 */
export const formatDate = (date) => {
  if (!date) return '-';
  try {
    return format(parseISO(date), 'dd.MM.yyyy', { locale: getLocale() });
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
    return format(parseISO(date), 'dd.MM.yyyy HH:mm', { locale: getLocale() });
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
      locale: getLocale(),
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
 * Generate text for days remaining (with optional translation function)
 */
export const getDaysRemainingText = (days, t) => {
  if (t) {
    if (days < 0) return t('status.expired');
    if (days === 0) return t('status.today');
    return t('status.daysLeft', { count: days });
  }

  // Fallback without translation
  if (days < 0) return 'EXPIRED';
  if (days === 0) return 'Today';
  return `${days} days`;
};

/**
 * Format notification status (with optional translation function)
 */
export const formatNotificationStatus = (status, t) => {
  if (t) {
    const statusMap = {
      sent: t('notifications.sent'),
      failed: t('notifications.failed'),
      pending: t('notifications.pending'),
    };
    return statusMap[status] || status;
  }

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
 * Format notification type (with optional translation function)
 */
export const formatNotificationType = (type, t) => {
  if (t) {
    const typeMap = {
      SMS: t('notifications.sms'),
      EMAIL: t('notifications.email'),
      BOTH: `${t('notifications.sms')} & ${t('notifications.email')}`,
    };
    return typeMap[type] || type;
  }

  const typeMap = {
    SMS: 'SMS',
    EMAIL: 'Email',
    BOTH: 'SMS & Email',
  };
  return typeMap[type] || type;
};
