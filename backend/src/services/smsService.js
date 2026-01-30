import twilio from 'twilio';
import config from '../config/env.js';

let client = null;

/**
 * Initialize Twilio client
 */
const initTwilioClient = () => {
  if (!config.twilio.accountSid || !config.twilio.authToken) {
    console.warn('⚠️  Twilio credentials not configured. SMS sending will be simulated.');
    return null;
  }

  try {
    client = twilio(config.twilio.accountSid, config.twilio.authToken);
    console.log('✅ Twilio client initialized');
    return client;
  } catch (error) {
    console.error('❌ Failed to initialize Twilio client:', error.message);
    return null;
  }
};

/**
 * Send SMS via Twilio
 * @param {string} phoneNumber - Recipient phone number (format: +40722XXXXXX)
 * @param {string} message - Message to send
 * @returns {Promise<object>} - Sending result
 */
export const sendSMS = async (phoneNumber, message) => {
  // Initialize client if it doesn't exist
  if (!client) {
    client = initTwilioClient();
  }

  // Simulation mode if credentials are not configured
  if (!client) {
    console.log('📱 [SIMULATED SMS]');
    console.log(`To: ${phoneNumber}`);
    console.log(`Message: ${message}`);
    console.log('─'.repeat(50));

    return {
      success: true,
      simulated: true,
      sid: `SIM${Date.now()}`,
      to: phoneNumber,
      body: message,
    };
  }

  // Phone number validation
  if (!phoneNumber.startsWith('+')) {
    // Add Romania prefix if missing
    phoneNumber = phoneNumber.startsWith('0')
      ? `+4${phoneNumber}`
      : `+${phoneNumber}`;
  }

  try {
    const result = await client.messages.create({
      body: message,
      from: config.twilio.phoneNumber,
      to: phoneNumber,
    });

    console.log(`✅ SMS sent successfully to ${phoneNumber} (SID: ${result.sid})`);

    return {
      success: true,
      sid: result.sid,
      status: result.status,
      to: result.to,
      body: result.body,
    };
  } catch (error) {
    console.error(`❌ Failed to send SMS to ${phoneNumber}:`, error.message);

    throw new Error(`SMS sending failed: ${error.message}`);
  }
};

/**
 * Check SMS status
 * @param {string} messageSid - Message SID
 * @returns {Promise<object>} - Message status
 */
export const checkSMSStatus = async (messageSid) => {
  if (!client) {
    client = initTwilioClient();
  }

  if (!client) {
    return { status: 'simulated' };
  }

  try {
    const message = await client.messages(messageSid).fetch();
    return {
      sid: message.sid,
      status: message.status,
      to: message.to,
      errorCode: message.errorCode,
      errorMessage: message.errorMessage,
    };
  } catch (error) {
    console.error('❌ Failed to check SMS status:', error.message);
    throw new Error(`SMS status check failed: ${error.message}`);
  }
};

export default {
  sendSMS,
  checkSMSStatus,
};
