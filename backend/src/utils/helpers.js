import { getTranslations, interpolate } from '../locales/index.js';

/**
 * Calculate the difference in days between two dates
 */
export const getDaysDifference = (date1, date2) => {
  const diffTime = Math.abs(new Date(date2) - new Date(date1));
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Check if a date is in the future
 */
export const isFutureDate = (date) => {
  return new Date(date) > new Date();
};

/**
 * Format date for messages (DD.MM.YYYY)
 */
export const formatDate = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
};

/**
 * Get the start of the current day
 */
export const getStartOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Get the end of the current day
 */
export const getEndOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

/**
 * Generate ITP reminder message (SMS)
 * @param {object} client - Client object
 * @param {number} daysRemaining - Days until expiration
 * @param {string} locale - Language code (ro, en, fr)
 */
export const generateItpReminderMessage = (client, daysRemaining, locale = 'ro') => {
  const { name, licensePlate, itpExpirationDate } = client;
  const formattedDate = formatDate(itpExpirationDate);
  const t = getTranslations(locale).sms;

  if (daysRemaining <= 0) {
    return interpolate(t.expired, { name, licensePlate, date: formattedDate });
  }

  const daysWord = daysRemaining === 1 ? t.day : t.days;
  return interpolate(t.reminder, {
    name,
    licensePlate,
    days: daysRemaining,
    daysWord,
    date: formattedDate,
  });
};

/**
 * Generate HTML template for email
 * @param {object} client - Client object
 * @param {number} daysRemaining - Days until expiration
 * @param {string} locale - Language code (ro, en, fr)
 */
export const generateEmailTemplate = (client, daysRemaining, locale = 'ro') => {
  const { name, licensePlate, itpExpirationDate } = client;
  const formattedDate = formatDate(itpExpirationDate);
  const urgency = daysRemaining <= 3 ? 'urgent' : 'normal';
  const color = urgency === 'urgent' ? '#ef4444' : '#f59e0b';
  const t = getTranslations(locale).email;

  const timeRemainingText = daysRemaining <= 0
    ? t.expired
    : `${daysRemaining} ${daysRemaining === 1 ? t.day : t.days}`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: ${color}; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
    .content { background-color: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 5px 5px; }
    .highlight { background-color: #fff; padding: 15px; margin: 20px 0; border-left: 4px solid ${color}; }
    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
    .button { display: inline-block; padding: 12px 24px; background-color: ${color}; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${t.title}</h1>
    </div>
    <div class="content">
      <p>${t.greeting} <strong>${name}</strong>,</p>

      <div class="highlight">
        <p>${t.intro}</p>
        <ul>
          <li><strong>${t.registrationNumber}:</strong> ${licensePlate}</li>
          <li><strong>${t.expirationDate}:</strong> ${formattedDate}</li>
          <li><strong>${t.timeRemaining}:</strong> ${timeRemainingText}</li>
        </ul>
      </div>

      ${daysRemaining <= 0
      ? `<p style="color: #ef4444; font-weight: bold;">${t.warningExpired}</p>`
      : `<p>${t.scheduleMessage}</p>`
    }

      <p><strong>${t.contactTitle}:</strong><br>
      ${t.phone}: 0722-XXX-XXX<br>
      ${t.email}: contact@serviceauto.ro</p>

      <p>${t.regards},<br>
      <strong>${t.team}</strong></p>
    </div>
    <div class="footer">
      <p>${t.footer}</p>
    </div>
  </div>
</body>
</html>
  `;
};

/**
 * Generate email subject
 * @param {object} client - Client object
 * @param {number} daysRemaining - Days until expiration
 * @param {string} locale - Language code (ro, en, fr)
 */
export const generateEmailSubject = (client, daysRemaining, locale = 'ro') => {
  const t = getTranslations(locale).email;
  const template = daysRemaining <= 0 ? t.subjectExpired : t.subject;
  return interpolate(template, { licensePlate: client.licensePlate });
};
