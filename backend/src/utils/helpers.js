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
 * Generate ITP reminder message
 */
export const generateItpReminderMessage = (client, daysRemaining) => {
  const { nume, numarInmatriculare, dataExpirareItp } = client;
  const formattedDate = formatDate(dataExpirareItp);

  if (daysRemaining <= 0) {
    return `Hello ${nume}! ITP for vehicle ${numarInmatriculare} expired on ${formattedDate}. Please urgently schedule a new inspection at our service.`;
  }

  return `Hello ${nume}! ITP for vehicle ${numarInmatriculare} expires in ${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'} (${formattedDate}). Please schedule a new inspection at our service.`;
};

/**
 * Generate HTML template for email
 */
export const generateEmailTemplate = (client, daysRemaining) => {
  const { nume, numarInmatriculare, dataExpirareItp } = client;
  const formattedDate = formatDate(dataExpirareItp);
  const urgency = daysRemaining <= 3 ? 'urgent' : 'normal';
  const color = urgency === 'urgent' ? '#ef4444' : '#f59e0b';

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
      <h1>🚗 ITP Reminder</h1>
    </div>
    <div class="content">
      <p>Hello <strong>${nume}</strong>,</p>

      <div class="highlight">
        <p>We inform you that the ITP for your vehicle:</p>
        <ul>
          <li><strong>Registration number:</strong> ${numarInmatriculare}</li>
          <li><strong>Expiration date:</strong> ${formattedDate}</li>
          <li><strong>Time remaining:</strong> ${daysRemaining <= 0 ? 'EXPIRED' : `${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'}`}</li>
        </ul>
      </div>

      ${daysRemaining <= 0
        ? '<p style="color: #ef4444; font-weight: bold;">⚠️ WARNING: Your ITP has expired! Driving with expired ITP is illegal and may result in penalties.</p>'
        : '<p>Please schedule a new periodic technical inspection as soon as possible.</p>'
      }

      <p><strong>Service contact:</strong><br>
      📞 Phone: 0722-XXX-XXX<br>
      📧 Email: contact@serviceauto.ro</p>

      <p>Best regards,<br>
      <strong>Auto Service Team</strong></p>
    </div>
    <div class="footer">
      <p>This email was sent automatically. Please do not reply to this message.</p>
    </div>
  </div>
</body>
</html>
  `;
};
