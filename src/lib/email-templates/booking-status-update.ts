import { getEmailBaseUrl } from '../email'

export function getBookingStatusUpdateTemplate(data: {
  name: string
  bookingId: string
  oldStatus: string
  newStatus: string
  labName: string
  baseUrl: string
  notes?: string | null
}): string {
  const { name, bookingId, oldStatus, newStatus, labName, baseUrl, notes } = data

  const statusLabels: Record<string, string> = {
    PENDING: 'Pending',
    CONFIRMED: 'Confirmed',
    SAMPLE_COLLECTED: 'Sample Collected',
    PROCESSING: 'Processing',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
  }

  const statusColors: Record<string, string> = {
    PENDING: '#f59e0b',
    CONFIRMED: '#3b82f6',
    SAMPLE_COLLECTED: '#8b5cf6',
    PROCESSING: '#6366f1',
    COMPLETED: '#10b981',
    CANCELLED: '#ef4444',
  }

  const newStatusLabel = statusLabels[newStatus] || newStatus
  const statusColor = statusColors[newStatus] || '#6b7280'

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Status Update - ${labName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 30px 30px; text-align: center; background: linear-gradient(135deg, #059669 0%, #10b981 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Booking Status Updated</h1>
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
                Your booking status has been updated.
              </p>
              
              <!-- Status Update -->
              <div style="margin: 30px 0; padding: 20px; background-color: #f9fafb; border-radius: 6px; border-left: 4px solid ${statusColor};">
                <div style="display: flex; align-items: center; margin-bottom: 15px;">
                  <div style="width: 12px; height: 12px; background-color: ${statusColor}; border-radius: 50%; margin-right: 10px;"></div>
                  <h2 style="margin: 0; color: #111827; font-size: 18px; font-weight: 600;">Status: ${newStatusLabel}</h2>
                </div>
                <p style="margin: 0; color: #6b7280; font-size: 14px;">
                  Previous status: <span style="color: #9ca3af;">${statusLabels[oldStatus] || oldStatus}</span> → New status: <span style="color: ${statusColor}; font-weight: 600;">${newStatusLabel}</span>
                </p>
              </div>
              
              ${notes ? `
              <div style="margin: 20px 0; padding: 15px; background-color: #eff6ff; border-radius: 6px; border-left: 4px solid #3b82f6;">
                <p style="margin: 0 0 8px; color: #1e40af; font-size: 14px; font-weight: 600;">Additional Notes:</p>
                <p style="margin: 0; color: #1e3a8a; font-size: 14px; line-height: 1.6;">${notes}</p>
              </div>
              ` : ''}
              
              <div style="margin: 30px 0; text-align: center;">
                <a href="${baseUrl}/bookings/${bookingId}" style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                  View Booking Details
                </a>
              </div>
              
              <p style="margin: 30px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                If you have any questions about this update, please don't hesitate to contact us.
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

