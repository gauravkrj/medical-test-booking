import { getEmailBaseUrl } from '../email'

export function getBookingConfirmationTemplate(data: {
  name: string
  bookingId: string
  bookingDate: string | null
  bookingTime: string | null
  bookingType: string
  totalAmount: number
  tests: Array<{ name: string; price: number }>
  labName: string
  baseUrl: string
}): string {
  const { name, bookingId, bookingDate, bookingTime, bookingType, totalAmount, tests, labName, baseUrl } = data

  const bookingTypeText = bookingType === 'HOME_COLLECTION' ? 'Home Collection' : 'Clinic Visit'
  const dateTimeText = bookingDate && bookingTime 
    ? `${new Date(bookingDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at ${bookingTime}`
    : bookingDate 
    ? `${new Date(bookingDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`
    : 'To be scheduled'

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation - ${labName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 30px 30px; text-align: center; background: linear-gradient(135deg, #059669 0%, #10b981 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Booking Confirmed!</h1>
              <p style="margin: 10px 0 0; color: #d1fae5; font-size: 16px;">Booking ID: ${bookingId}</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Hello <strong>${name}</strong>,
              </p>
              
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Your booking has been confirmed. We'll be in touch soon with further details.
              </p>
              
              <!-- Booking Details -->
              <div style="margin: 30px 0; padding: 20px; background-color: #f9fafb; border-radius: 6px; border-left: 4px solid #10b981;">
                <h2 style="margin: 0 0 15px; color: #111827; font-size: 18px; font-weight: 600;">Booking Details</h2>
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 40%;">Booking Type:</td>
                    <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600;">${bookingTypeText}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Date & Time:</td>
                    <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600;">${dateTimeText}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Total Amount:</td>
                    <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600;">₹${totalAmount.toLocaleString('en-IN')}</td>
                  </tr>
                </table>
              </div>
              
              <!-- Tests List -->
              <div style="margin: 30px 0;">
                <h2 style="margin: 0 0 15px; color: #111827; font-size: 18px; font-weight: 600;">Tests Booked</h2>
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
                      <td style="padding: 12px; color: #111827; font-size: 14px; font-weight: 600; border-top: 2px solid #e5e7eb;">Total</td>
                      <td style="padding: 12px; text-align: right; color: #111827; font-size: 14px; font-weight: 600; border-top: 2px solid #e5e7eb;">₹${totalAmount.toLocaleString('en-IN')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div style="margin: 30px 0; text-align: center;">
                <a href="${baseUrl}/bookings/${bookingId}" style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                  View Booking Details
                </a>
              </div>
              
              <p style="margin: 30px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                If you have any questions about your booking, please don't hesitate to contact us.
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

