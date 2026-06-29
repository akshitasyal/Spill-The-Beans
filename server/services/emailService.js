import nodemailer from 'nodemailer';
import logger from '../middleware/logger.js';
import { welcomeTemplate } from '../templates/email/welcome.js';
import { orderConfirmationTemplate } from '../templates/email/orderConfirmation.js';
import { shippingUpdateTemplate } from '../templates/email/shippingUpdate.js';
import { passwordResetTemplate } from '../templates/email/passwordReset.js';
import { reviewRequestTemplate } from '../templates/email/reviewRequest.js';

// Setup email SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: parseInt(process.env.SMTP_PORT || '2525'),
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

export const EmailService = {
  /**
   * Helper to send an HTML email
   */
  async sendEmail({ to, subject, html }) {
    try {
      const info = await transporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME || 'Spill The Beans'}" <${process.env.SMTP_FROM_EMAIL || 'no-reply@spillthebeans.in'}>`,
        to,
        subject,
        html,
      });
      logger.info(`Email successfully sent to ${to}. Message ID: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      logger.error(`Failed to send email to ${to}: ${err.message}`, err);
      // Log for backup: in non-prod environments or missing smtp config, fail gracefully
      return { success: false, error: err.message };
    }
  },

  /**
   * Send Welcome Email
   */
  async sendWelcomeEmail(to, name) {
    const html = welcomeTemplate(name);
    return this.sendEmail({
      to,
      subject: `Welcome to Spill The Beans, ${name}! ☕`,
      html,
    });
  },

  /**
   * Send Order Confirmation Email
   */
  async sendOrderConfirmation(to, order) {
    const html = orderConfirmationTemplate(order);
    return this.sendEmail({
      to,
      subject: `Order Confirmation #${order.id} - Spill The Beans`,
      html,
    });
  },

  /**
   * Send Shipping Update Email
   */
  async sendShippingUpdate(to, order, trackingNum, courier) {
    const html = shippingUpdateTemplate(order, trackingNum, courier);
    return this.sendEmail({
      to,
      subject: `Your order #${order.id} has been shipped! 🚀`,
      html,
    });
  },

  /**
   * Send Password Reset Email
   */
  async sendPasswordReset(to, name, resetUrl) {
    const html = passwordResetTemplate(name, resetUrl);
    return this.sendEmail({
      to,
      subject: 'Reset Your Password - Spill The Beans',
      html,
    });
  },

  /**
   * Send Review Request Email
   */
  async sendReviewRequest(to, name, productName, reviewUrl) {
    const html = reviewRequestTemplate(name, productName, reviewUrl);
    return this.sendEmail({
      to,
      subject: `How did you like the ${productName}? 🌟`,
      html,
    });
  },
};
