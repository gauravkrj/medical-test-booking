import { getEmailBaseUrl } from '../email'

export function getPasswordResetTemplate(data: {
  name: string
  resetUrl: string
  labName: string
  expiresIn: string
}): string {
  const { name, resetUrl, labName, expiresIn } = data

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password - ${labName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 30px 30px; text-align: center; background: linear-gradient(135deg, #059669 0%, #10b981 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Reset Your Password</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Hello <strong>${name}</strong>,
              </p>
              
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                We received a request to reset your password for your ${labName} account. Click the button below to create a new password.
              </p>
              
              <div style="margin: 30px 0; text-align: center;">
                <a href="${resetUrl}" style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                  Reset Password
                </a>
              </div>
              
              <p style="margin: 20px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Or copy and paste this link into your browser:
              </p>
              <p style="margin: 0 0 20px; padding: 12px; background-color: #f9fafb; border-radius: 4px; word-break: break-all; color: #3b82f6; font-size: 12px; font-family: monospace;">
                ${resetUrl}
              </p>
              
              <div style="margin: 30px 0; padding: 15px; background-color: #fef3c7; border-radius: 6px; border-left: 4px solid #f59e0b;">
                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                  <strong>⚠️ Important:</strong> This link will expire in ${expiresIn}. If you didn't request a password reset, please ignore this email and your password will remain unchanged.
                </p>
              </div>
              
              <p style="margin: 30px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                For security reasons, if you didn't request this password reset, please contact our support team immediately.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 30px; background-color: #f9fafb; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 12px; text-align: center; line-height: 1.6;">
                This is an automated email from ${labName}. Please do not reply to this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

