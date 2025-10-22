import nodemailer from 'nodemailer';

// Build transporter on-demand using current environment variables. This is
// resilient to process-level ordering and makes diagnostics easier when
// dotenv is loaded before server start.
function buildTransporter() {
  const hasSmtpConfig = !!(process.env.EMAIL_HOST && process.env.EMAIL_PORT && process.env.EMAIL_USER && process.env.EMAIL_PASSWORD);

  if (hasSmtpConfig) {
    const transport = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log('Warning: SMTP config detected while NODE_ENV !== production — emails will be sent using provided SMTP settings.');
    }

    return { transport, hasSmtpConfig: true };
  }

  // Development fallback: use json transport so nothing is sent over the network.
  const transport = nodemailer.createTransport({ jsonTransport: true });
  return { transport, hasSmtpConfig: false };
}

export async function sendEmail({ to, subject, text, html }) {
  const { transport: transporter, hasSmtpConfig } = buildTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'no-reply@example.com',
    to,
    subject,
    text,
    html,
  };

  // If SMTP is configured, attempt to verify before sending to provide
  // immediate feedback about auth/connectivity issues.
  if (hasSmtpConfig) {
    try {
      await transporter.verify();
      console.log('SMTP verification successful. Sending email to', to);
    } catch (err) {
      console.error('SMTP verification failed:', err && err.message ? err.message : err);
      if ((process.env.EMAIL_HOST && process.env.EMAIL_HOST.includes('gmail')) || (process.env.EMAIL_USER && process.env.EMAIL_USER.includes('gmail'))) {
        console.error('Hint: For Gmail, ensure you use an App Password (if the account has 2FA) or allow less secure apps (not recommended).');
        console.error('Also double-check the EMAIL_PASSWORD in your .env — avoid unintentional spaces or line breaks.');
      }
      // Continue: attempt to send anyway; sendMail will also fail but will provide
      // the full error which we will log and (in production) rethrow.
    }
  }

  try {
    const info = await transporter.sendMail(mailOptions);

    if (!hasSmtpConfig) {
      // Development: log the email contents so OTPs are visible during testing.
      console.log('\n[DEV EMAIL] Email would have been sent.');
      console.log('To:', to);
      console.log('Subject:', subject);
      if (text) console.log('Text:', text);
      if (html) console.log('HTML:', html);
      console.log('Nodemailer info:', info && info.messageId ? info.messageId : info);
    } else {
      console.log('Email sent. Nodemailer info:', info && (info.messageId || info.response) ? (info.messageId || info.response) : info);
    }

    return info;
  } catch (err) {
    console.error('Error sending email:', err && err.message ? err.message : err);

    if (hasSmtpConfig && process.env.NODE_ENV === 'production') {
      throw err;
    }

    return {
      accepted: [],
      rejected: [to],
      messageId: 'dev-fallback',
      error: err && err.message ? err.message : String(err),
    };
  }
}
