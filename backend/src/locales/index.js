/**
 * Backend localization for notification templates
 */

const locales = {
  ro: {
    sms: {
      reminder: 'Buna ziua {{name}}! ITP pentru vehiculul {{licensePlate}} expira in {{days}} {{daysWord}} ({{date}}). Va rugam sa programati o noua inspectie la service-ul nostru.',
      expired: 'Buna ziua {{name}}! ITP pentru vehiculul {{licensePlate}} a expirat la data {{date}}. Va rugam sa programati urgent o noua inspectie la service-ul nostru.',
      day: 'zi',
      days: 'zile',
    },
    email: {
      subject: 'Reminder ITP - {{licensePlate}}',
      subjectExpired: 'ITP Expirat - {{licensePlate}}',
      greeting: 'Buna ziua',
      title: 'Reminder ITP',
      intro: 'Va informam ca ITP pentru vehiculul dumneavoastra:',
      registrationNumber: 'Numar inmatriculare',
      expirationDate: 'Data expirare',
      timeRemaining: 'Timp ramas',
      expired: 'EXPIRAT',
      day: 'zi',
      days: 'zile',
      warningExpired: 'ATENTIE: ITP-ul dumneavoastra a expirat! Circulatia cu ITP expirat este ilegala si poate duce la penalizari.',
      scheduleMessage: 'Va rugam sa programati o noua inspectie tehnica periodica cat mai curand posibil.',
      contactTitle: 'Contact service',
      phone: 'Telefon',
      email: 'Email',
      regards: 'Cu stima',
      team: 'Echipa Service Auto',
      footer: 'Acest email a fost trimis automat. Va rugam sa nu raspundeti la acest mesaj.',
    },
  },
  en: {
    sms: {
      reminder: 'Hello {{name}}! ITP for vehicle {{licensePlate}} expires in {{days}} {{daysWord}} ({{date}}). Please schedule a new inspection at our service.',
      expired: 'Hello {{name}}! ITP for vehicle {{licensePlate}} expired on {{date}}. Please urgently schedule a new inspection at our service.',
      day: 'day',
      days: 'days',
    },
    email: {
      subject: 'ITP Reminder - {{licensePlate}}',
      subjectExpired: 'ITP Expired - {{licensePlate}}',
      greeting: 'Hello',
      title: 'ITP Reminder',
      intro: 'We inform you that the ITP for your vehicle:',
      registrationNumber: 'Registration number',
      expirationDate: 'Expiration date',
      timeRemaining: 'Time remaining',
      expired: 'EXPIRED',
      day: 'day',
      days: 'days',
      warningExpired: 'WARNING: Your ITP has expired! Driving with expired ITP is illegal and may result in penalties.',
      scheduleMessage: 'Please schedule a new periodic technical inspection as soon as possible.',
      contactTitle: 'Service contact',
      phone: 'Phone',
      email: 'Email',
      regards: 'Best regards',
      team: 'Auto Service Team',
      footer: 'This email was sent automatically. Please do not reply to this message.',
    },
  },
  fr: {
    sms: {
      reminder: 'Bonjour {{name}}! Le controle technique pour le vehicule {{licensePlate}} expire dans {{days}} {{daysWord}} ({{date}}). Veuillez programmer une nouvelle inspection dans notre service.',
      expired: 'Bonjour {{name}}! Le controle technique pour le vehicule {{licensePlate}} a expire le {{date}}. Veuillez programmer une nouvelle inspection de toute urgence.',
      day: 'jour',
      days: 'jours',
    },
    email: {
      subject: 'Rappel Controle Technique - {{licensePlate}}',
      subjectExpired: 'Controle Technique Expire - {{licensePlate}}',
      greeting: 'Bonjour',
      title: 'Rappel Controle Technique',
      intro: 'Nous vous informons que le controle technique de votre vehicule:',
      registrationNumber: 'Numero d\'immatriculation',
      expirationDate: 'Date d\'expiration',
      timeRemaining: 'Temps restant',
      expired: 'EXPIRE',
      day: 'jour',
      days: 'jours',
      warningExpired: 'ATTENTION: Votre controle technique a expire! Circuler avec un controle technique expire est illegal et peut entrainer des penalites.',
      scheduleMessage: 'Veuillez programmer un nouveau controle technique periodique des que possible.',
      contactTitle: 'Contact service',
      phone: 'Telephone',
      email: 'Email',
      regards: 'Cordialement',
      team: 'L\'equipe Service Auto',
      footer: 'Cet email a ete envoye automatiquement. Veuillez ne pas repondre a ce message.',
    },
  },
};

/**
 * Get translations for a specific locale
 * @param {string} locale - Language code (ro, en, fr)
 * @returns {object} Translation object
 */
export const getTranslations = (locale = 'ro') => {
  return locales[locale] || locales.ro;
};

/**
 * Replace template variables in a string
 * @param {string} template - Template string with {{variable}} placeholders
 * @param {object} variables - Object with variable values
 * @returns {string} String with replaced variables
 */
export const interpolate = (template, variables) => {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] !== undefined ? variables[key] : match;
  });
};

export default locales;
