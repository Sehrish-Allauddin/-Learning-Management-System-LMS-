const nodemailer = require('nodemailer');

const EMAIL_ADDRESS = 'projectidp75@gmail.com';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || EMAIL_ADDRESS,
    pass: process.env.SMTP_PASS
  }
});

// Optional SMTP connection test
const verifyEmailConnection = async () => {
  try {
    await transporter.verify();
    console.log('Gmail SMTP connection successful');
    return true;
  } catch (error) {
    console.error('Gmail SMTP connection failed:', error.message);
    return false;
  }
};

// ----------------------------------------------------
// Password Reset Email
// ----------------------------------------------------
const sendResetEmail = async (userEmail, resetLink) => {
  try {
    const mailOptions = {
      from: `"LMS Security" <${EMAIL_ADDRESS}>`,
      to: userEmail || EMAIL_ADDRESS,
      subject: 'LMS Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          
          <h2 style="color: #047857;">Password Reset Request</h2>

          <p>Hello,</p>

          <p>
            You recently requested to reset your password for your LMS account.
          </p>

          <p>
            Click the button below to set a new password.
            This link is valid for 1 hour.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a
              href="${resetLink}"
              style="
                display: inline-block;
                padding: 12px 24px;
                background-color: #047857;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
              "
            >
              Reset Password
            </a>
          </div>

          <p style="font-size: 14px; color: #6b7280;">
            If you did not request a password reset, please ignore this email.
          </p>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />

          <p style="font-size: 12px; color: #9ca3af;">
            Best regards,<br />
            LMS Team
          </p>

        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('Password reset email sent:', info.messageId);

    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error.message);

    return false;
  }
};

// ----------------------------------------------------
// OTP Email
// ----------------------------------------------------
const sendOTPEmail = async (userEmail, otpCode) => {
  try {
    const mailOptions = {
      from: `"LMS Security" <${EMAIL_ADDRESS}>`,
      to: userEmail || EMAIL_ADDRESS,
      subject: 'Your LMS 2FA Login Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">

          <h2 style="color: #047857;">
            Two-Factor Authentication
          </h2>

          <p>Hello,</p>

          <p>
            Please use the following 6-digit code to complete your LMS login.
          </p>

          <p>
            This code expires in <strong>5 minutes</strong>.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <div
              style="
                display: inline-block;
                padding: 16px 32px;
                background-color: #f3f4f6;
                color: #111827;
                border-radius: 8px;
                font-weight: bold;
                font-size: 32px;
                letter-spacing: 8px;
              "
            >
              ${otpCode}
            </div>
          </div>

          <p style="font-size: 14px; color: #6b7280;">
            If you did not attempt to log in, please secure your account immediately.
          </p>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />

          <p style="font-size: 12px; color: #9ca3af;">
            Best regards,<br />
            LMS Security Team
          </p>

        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('OTP email sent:', info.messageId);

    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error.message);

    return false;
  }
};

// ----------------------------------------------------
// Reminder Email
// ----------------------------------------------------
const sendReminderEmail = async (userEmail, userName, courseTitle) => {
  try {
    const mailOptions = {
      from: `"LMS" <${EMAIL_ADDRESS}>`,
      to: userEmail || EMAIL_ADDRESS,
      subject: `Reminder: Complete your training - ${courseTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">

          <h2 style="color: #047857;">
            Training Reminder
          </h2>

          <p>
            Hello ${userName},
          </p>

          <p>
            This is a friendly reminder that you have incomplete modules
            in the course <strong>${courseTitle}</strong>.
          </p>

          <p>
            Please log in to the LMS to resume and complete your training.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a
              href="http://localhost:5173/dashboard"
              style="
                display: inline-block;
                padding: 12px 24px;
                background-color: #047857;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
              "
            >
              Go to Dashboard
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />

          <p style="font-size: 12px; color: #9ca3af;">
            Best regards,<br />
            LMS Team
          </p>

        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('Reminder email sent:', info.messageId);

    return true;
  } catch (error) {
    console.error('Error sending reminder email:', error.message);

    return false;
  }
};

module.exports = {
  sendResetEmail,
  sendOTPEmail,
  sendReminderEmail,
  verifyEmailConnection
};