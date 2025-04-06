const twilio = require('twilio');
const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');
const NotificationLog = require('../models/NotificationLogs');
const logger = require('../utils/logger');

const initializeClients = (emailClient="nodemailer") => {
  let twilioClient = null;
  let nodemailerTransport = null;

  if(emailClient === "sendgrid" && process.env.SENDGRID_API_KEY){
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  } 
  else if(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    nodemailerTransport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });
  }

  if(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }

  return {
    twilioClient,
    nodemailerTransport
  };
};

const clients = initializeClients();

const getTodayCount = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return await NotificationLog.countDocuments({ 
    createdAt: { $gte: today },
    status: 'sent'
  });
};

const canSendToday = async (type) => {
  const sentToday = await getTodayCount();
  const typeLimit = parseInt(process.env[`DAILY_${type.toUpperCase()}_LIMIT`], 50);
  
  if (sentToday >= typeLimit) {
    logger.warn(`${type} limit of ${typeLimit} reached for today.`);
    return false;
  }
  return true;
};

const emailServices = {
  nodemailer: async (to, subject, text, html) => {
    if (!clients.nodemailerTransport) {
      throw new Error('Nodemailer not configured');
    }

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to,
      subject,
      text,
      html: html || undefined
    };

    const info = await clients.nodemailerTransport.sendMail(mailOptions);
    logger.info(`📧 Email sent via Nodemailer: ${info.messageId}`);
    return info;
  },

  sendgrid: async (to, subject, text, html) => {
    if (!process.env.SENDGRID_API_KEY) {
      throw new Error('SendGrid not configured');
    }

    const msg = {
      to,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject,
      text,
      html: html || text
    };

    const info = await sgMail.send(msg);
    logger.info(`📧 Email sent via SendGrid: ${info[0]?.statusCode}`);
    return info;
  },
};

const sendEmail = async (to, subject, text, html, options={}) => {
  let preferredService = options.client || 'nodemailer';

  let create = { 
    type: 'email', 
    recipient: to, 
    message: `${subject}\n${text}`, 
    provider: preferredService,
    status: 'pending'
  }

  if(options.referenceType && options.referenceId) {
    create.referenceType = options.referenceType;
    create.referenceId = options.referenceId;
  }

  const log = await NotificationLog.create(create);

  if (!(await canSendToday('email'))) {
    log.status = 'limit_reached';
    await log.save();
    return;
  }

  try {
    if(preferredService === 'nodemailer') {
      await emailServices.nodemailer(to, subject, text, html);
    } else if(preferredService === 'sendgrid') {
      await emailServices.sendgrid(to, subject, text, html);
    }

    log.status = 'sent';
    await log.save();
  } catch (err) {
    log.status = 'failed';
    log.remarks = err.message;
    await log.save();
    logger.error(`❌ Email error: ${err.message}`);
  }
};

const sendSMS = async (toPhone, message, options={}) => {
  if ((toPhone + "").length === 10) {
    toPhone = "+91" + toPhone;
  }

  let create = { 
    type: 'sms', 
    recipient: toPhone, 
    message, 
    provider: 'twilio',
    status: 'pending' 
  }

  if(options.referenceType && options.referenceId) {
    create.referenceType = options.referenceType;
    create.referenceId = options.referenceId;
  }

  const log = await NotificationLog.create(create);

  if (!(await canSendToday('sms'))) {
    log.status = 'limit_reached';
    await log.save();
    return;
  }

  if (!clients.twilioClient) {
    log.status = 'failed';
    log.remarks = 'Twilio not configured';
    await log.save();
    logger.error('❌ Twilio not configured');
    return;
  }

  try {
    const result = await clients.twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: toPhone
    });
    
    log.status = 'sent';
    log.remarks = `SID: ${result.sid}`;
    await log.save();
    logger.info(`📲 SMS sent to ${toPhone} (SID: ${result.sid})`);
  } catch (err) {
    log.status = 'failed';
    log.remarks = err.message;
    await log.save();
    logger.error(`❌ Twilio SMS error: ${err.message}`);
  }
};

module.exports = {
  sendEmail,
  sendSMS
};