import nodemailer from 'nodemailer';
import config from '../config/env.js';

let transporter = null;

/**
 * Initialize Nodemailer transporter
 */
const initTransporter = () => {
  if (!config.email.user || !config.email.password) {
    console.warn('⚠️  Email credentials not configured. Email sending will be simulated.');
    return null;
  }

  try {
    transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: {
        user: config.email.user,
        pass: config.email.password,
      },
    });

    console.log('✅ Email transporter initialized');
    return transporter;
  } catch (error) {
    console.error('❌ Failed to initialize email transporter:', error.message);
    return null;
  }
};

/**
 * Send email
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - HTML content
 * @param {string} text - Text content (optional, fallback for HTML)
 * @returns {Promise<object>} - Sending result
 */
export const sendEmail = async (to, subject, html, text = null) => {
  // Initialize transporter if it doesn't exist
  if (!transporter) {
    transporter = initTransporter();
  }

  // Simulation mode if credentials are not configured
  if (!transporter) {
    console.log('📧 [SIMULATED EMAIL]');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`HTML Length: ${html.length} characters`);
    console.log('─'.repeat(50));

    return {
      success: true,
      simulated: true,
      messageId: `SIM${Date.now()}@simulated.local`,
      to,
      subject,
    };
  }

  try {
    const mailOptions = {
      from: config.email.from,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text fallback
    };

    const result = await transporter.sendMail(mailOptions);

    console.log(`✅ Email sent successfully to ${to} (ID: ${result.messageId})`);

    return {
      success: true,
      messageId: result.messageId,
      to: result.accepted,
      rejected: result.rejected,
    };
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error.message);
    throw new Error(`Email sending failed: ${error.message}`);
  }
};

/**
 * Verify email server connection
 * @returns {Promise<boolean>}
 */
export const verifyEmailConnection = async () => {
  if (!transporter) {
    transporter = initTransporter();
  }

  if (!transporter) {
    return false;
  }

  try {
    await transporter.verify();
    console.log('✅ Email server connection verified');
    return true;
  } catch (error) {
    console.error('❌ Email server connection failed:', error.message);
    return false;
  }
};

export default {
  sendEmail,
  verifyEmailConnection,
};
