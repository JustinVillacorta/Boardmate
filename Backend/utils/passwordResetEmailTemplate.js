export function buildPasswordResetEmail({ accountName, accountDisplayType, otp, ttlMinutes }) {
  return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f4f4f7;
            color: #333333;
          }
          .email-container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .email-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 30px;
            text-align: center;
            color: #ffffff;
          }
          .email-header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
          }
          .email-body {
            padding: 40px 30px;
          }
          .greeting {
            font-size: 18px;
            color: #1f2937;
            margin-bottom: 20px;
          }
          .message {
            font-size: 15px;
            color: #6b7280;
            line-height: 1.6;
            margin-bottom: 30px;
          }
          .otp-container {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
          }
          .otp-label {
            color: rgba(255, 255, 255, 0.9);
            font-size: 14px;
            font-weight: 500;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .otp-code {
            font-size: 42px;
            font-weight: bold;
            color: #ffffff;
            letter-spacing: 8px;
            font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
            margin: 10px 0;
          }
          .expiry {
            text-align: center;
            font-size: 13px;
            color: #6b7280;
            margin: 20px 0;
            padding: 15px;
            background-color: #f9fafb;
            border-radius: 8px;
          }
          .security-note {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 25px 0;
            border-radius: 6px;
          }
          .security-note strong {
            color: #92400e;
            font-size: 14px;
            display: block;
            margin-bottom: 5px;
          }
          .security-note p {
            margin: 0;
            font-size: 13px;
            color: #78350f;
            line-height: 1.5;
          }
          .email-footer {
            background-color: #f9fafb;
            padding: 25px 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
          }
          .email-footer p {
            margin: 0;
            font-size: 12px;
            color: #9ca3af;
            line-height: 1.6;
          }
          .brand {
            color: #667eea;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="email-header">
            <h1>🔐 Password Reset</h1>
          </div>

          <div class="email-body">
            <div class="greeting">Hello ${accountName},</div>

            <div class="message">
              We received a request to reset your password for your <span class="brand">Boardmate</span> account (${accountDisplayType}).
              Use the verification code below to continue with the password reset process.
            </div>

            <div class="otp-container">
              <div class="otp-label">Your Verification Code</div>
              <div class="otp-code">${otp}</div>
            </div>

            <div class="expiry">
              ⏰ This code will expire in <strong>${ttlMinutes} minutes</strong>
            </div>

            <div class="security-note">
              <strong>🔒 Security Notice</strong>
              <p>If you didn't request this password reset, please ignore this email. Never share this code with anyone. Our team will never ask for your verification code.</p>
            </div>
          </div>

          <div class="email-footer">
            <p><strong>Boardmate Management System</strong></p>
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>© ${new Date().getFullYear()} Boardmate. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
}
