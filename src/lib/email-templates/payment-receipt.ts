import { getEmailBaseUrl } from '../email'

export function getPaymentReceiptTemplate(data: {
  name: string
  bookingId: string
  paymentId: string
  paymentDate: string
  totalAmount: number
  paymentMethod: string
  tests: Array<{ name: string; price: number }>
  labName: string
  baseUrl: string
  address?: string | null
}): string {
  const { name, bookingId, paymentId, paymentDate, totalAmount, paymentMethod, tests, labName, baseUrl, address } = data

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Receipt - ${labName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 30px 30px; text-align: center; background: linear-gradient(135deg, #059669 0%, #10b981 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Payment Receipt</h1>
              <p style="margin: 10px 0 0; color: #d1fae5; font-size: 16px;">Thank you for your payment!</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Hello <strong>${name}</strong>,
              </p>
              
              <p style="margin: 0 0 30px; color: #374151; font-size: 16px; line-height: 1.6;">
                This is your payment receipt for booking #${bookingId}. Please keep this receipt for your records.
              </p>
              
              <!-- Payment Details -->
              <div style="margin: 30px 0; padding: 20px; background-color: #f9fafb; border-radius: 6px; border-left: 4px solid #10b981;">
                <h2 style="margin: 0 0 15px; color: #111827; font-size: 18px; font-weight: 600;">Payment Information</h2>
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 40%;">Payment ID:</td>
                    <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; font-family: monospace;">${paymentId}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Payment Date:</td>
                    <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600;">${new Date(paymentDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Payment Method:</td>
                    <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600;">${paymentMethod}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Amount Paid:</td>
                    <td style="padding: 8px 0; color: #10b981; font-size: 18px; font-weight: 700;">₹${totalAmount.toLocaleString('en-IN')}</td>
                  </tr>
                </table>
              </div>
              
              <!-- Tests List -->
              <div style="margin: 30px 0;">
                <h2 style="margin: 0 0 15px; color: #111827; font-size: 18px; font-weight: 600;">Items Paid For</h2>
                <table role="presentation" style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 6px; overflow: hidden;">
                  <thead>
                    <tr style="background-color: #f9fafb;">
                      <th style="padding: 12px; text-align: left; color: #374151; font-size: 14px; font-weight: 600; border-bottom: 1px solid #e5e7eb;">Test Name</th>
                      <th style="padding: 12px; text-align: right; color: #374151; font-size: 14px; font-weight: 600; border-bottom: 1px solid #e5e7eb;">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${tests.map(test => `
                      <tr>
                        <td style="padding: 12px; color: #111827; font-size: 14px; border-bottom: 1px solid #e5e7eb;">${test.name}</td>
                        <td style="padding: 12px; text-align: right; color: #111827; font-size: 14px; border-bottom: 1px solid #e5e7eb;">₹${test.price.toLocaleString('en-IN')}</td>
                      </tr>
                    `).join('')}
                    <tr style="background-color: #f9fafb;">
                      <td style="padding: 12px; color: #111827; font-size: 16px; font-weight: 600; border-top: 2px solid #e5e7eb;">Total Amount</td>
                      <td style="padding: 12px; text-align: right; color: #10b981; font-size: 18px; font-weight: 700; border-top: 2px solid #e5e7eb;">₹${totalAmount.toLocaleString('en-IN')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              ${address ? `
              <div style="margin: 20px 0; padding: 15px; background-color: #eff6ff; border-radius: 6px; border-left: 4px solid #3b82f6;">
                <p style="margin: 0 0 8px; color: #1e40af; font-size: 14px; font-weight: 600;">Billing Address:</p>
                <p style="margin: 0; color: #1e3a8a; font-size: 14px; line-height: 1.6; white-space: pre-line;">${address}</p>
              </div>
              ` : ''}
              
              <div style="margin: 30px 0; text-align: center;">
                <a href="${baseUrl}/bookings/${bookingId}" style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                  View Booking Details
                </a>
              </div>
              
              <div style="margin: 30px 0; padding: 15px; background-color: #f0fdf4; border-radius: 6px; border-left: 4px solid #10b981;">
                <p style="margin: 0; color: #166534; font-size: 14px; line-height: 1.6;">
                  <strong>✓ Payment Received:</strong> Your payment has been successfully processed. This receipt serves as proof of payment.
                </p>
              </div>
              
              <p style="margin: 30px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                If you have any questions about this payment, please contact our support team.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 30px; background-color: #f9fafb; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 12px; text-align: center; line-height: 1.6;">
                This is an automated email from ${labName}. Please do not reply to this email.
              </p>
              <p style="margin: 10px 0 0; color: #9ca3af; font-size: 11px; text-align: center; line-height: 1.6;">
                This receipt is for your records. Please save it for your reference.
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

