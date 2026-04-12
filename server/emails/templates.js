/**
 * MotoLease branded HTML email templates.
 * All templates use blue (#1D4ED8) and white color scheme with inline CSS.
 */

const baseStyles = `
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: #f8fafc;
  margin: 0;
  padding: 0;
`;

const wrapTemplate = (content) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="${baseStyles}">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1D4ED8, #3B82F6); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">🚗 MotoLease</h1>
      <p style="color: #BFDBFE; margin: 5px 0 0; font-size: 14px;">Premium Car Rental Platform</p>
    </div>
    <!-- Content -->
    <div style="background: #ffffff; padding: 32px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.07);">
      ${content}
    </div>
    <!-- Footer -->
    <div style="text-align: center; padding: 20px; color: #64748B; font-size: 12px;">
      <p style="margin: 0;">© ${new Date().getFullYear()} MotoLease. All rights reserved.</p>
      <p style="margin: 5px 0 0;">This is an automated email. Please do not reply.</p>
    </div>
  </div>
</body>
</html>
`;

/** 1. Welcome email — sent on user registration */
export const welcomeEmail = (name) =>
  wrapTemplate(`
    <h2 style="color: #1E293B; margin-top: 0;">Welcome to MotoLease, ${name}! 🎉</h2>
    <p style="color: #475569; line-height: 1.6;">Thank you for joining MotoLease — the premium car rental platform. Your account has been created successfully.</p>
    <p style="color: #475569; line-height: 1.6;">Start exploring our wide range of vehicles and book your perfect ride today.</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.CLIENT_URL}/cars" style="background: #1D4ED8; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Browse Cars</a>
    </div>
    <p style="color: #94A3B8; font-size: 13px;">If you didn't create this account, please ignore this email.</p>
  `);

/** 2. Owner request received */
export const ownerRequestReceivedEmail = (name) =>
  wrapTemplate(`
    <h2 style="color: #1E293B; margin-top: 0;">Application Received, ${name} 📋</h2>
    <p style="color: #475569; line-height: 1.6;">We have received your application to become a car owner on MotoLease.</p>
    <p style="color: #475569; line-height: 1.6;">Our team is reviewing your submitted documents. You will receive an email once your application has been processed.</p>
    <div style="background: #EFF6FF; padding: 16px; border-radius: 8px; border-left: 4px solid #1D4ED8; margin: 20px 0;">
      <p style="color: #1E293B; margin: 0; font-weight: 600;">What happens next?</p>
      <ul style="color: #475569; margin: 8px 0 0; padding-left: 20px;">
        <li>Our team reviews your documents (1-2 business days)</li>
        <li>You'll receive an approval or rejection email</li>
        <li>Once approved, you can start listing your cars!</li>
      </ul>
    </div>
  `);

/** 3. Owner request approved */
export const ownerApprovedEmail = (name, email) =>
  wrapTemplate(`
    <h2 style="color: #1E293B; margin-top: 0;">Congratulations, ${name}! 🎊</h2>
    <p style="color: #475569; line-height: 1.6;">Your application to become a car owner on MotoLease has been <strong style="color: #16A34A;">approved!</strong></p>
    <div style="background: #F0FDF4; padding: 16px; border-radius: 8px; border-left: 4px solid #16A34A; margin: 20px 0;">
      <p style="color: #1E293B; margin: 0; font-weight: 600;">Your Login Credentials:</p>
      <p style="color: #475569; margin: 8px 0 0;">
        <strong>Email:</strong> ${email}<br>
        <strong>Password:</strong> Use the password you provided during registration
      </p>
    </div>
    <p style="color: #475569; line-height: 1.6;">You can now log in and start listing your cars on the platform.</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.CLIENT_URL}/login" style="background: #1D4ED8; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Login Now</a>
    </div>
  `);

/** 4. Owner request rejected */
export const ownerRejectedEmail = (name, reason) =>
  wrapTemplate(`
    <h2 style="color: #1E293B; margin-top: 0;">Application Update, ${name}</h2>
    <p style="color: #475569; line-height: 1.6;">We regret to inform you that your application to become a car owner on MotoLease has been <strong style="color: #DC2626;">declined</strong>.</p>
    <div style="background: #FEF2F2; padding: 16px; border-radius: 8px; border-left: 4px solid #DC2626; margin: 20px 0;">
      <p style="color: #1E293B; margin: 0; font-weight: 600;">Reason:</p>
      <p style="color: #475569; margin: 8px 0 0;">${reason}</p>
    </div>
    <p style="color: #475569; line-height: 1.6;">You are welcome to submit a new application after addressing the above concerns.</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.CLIENT_URL}/owner/apply" style="background: #1D4ED8; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Apply Again</a>
    </div>
  `);

/** 5a. Booking confirmed — sent to user */
export const bookingConfirmedUserEmail = (userName, carTitle, startDate, endDate, totalAmount) =>
  wrapTemplate(`
    <h2 style="color: #1E293B; margin-top: 0;">Booking Confirmed! ✅</h2>
    <p style="color: #475569; line-height: 1.6;">Hi ${userName}, your booking has been confirmed!</p>
    <div style="background: #EFF6FF; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="color: #64748B; padding: 6px 0;">Car</td><td style="color: #1E293B; font-weight: 600; text-align: right;">${carTitle}</td></tr>
        <tr><td style="color: #64748B; padding: 6px 0;">Start Date</td><td style="color: #1E293B; font-weight: 600; text-align: right;">${new Date(startDate).toLocaleDateString()}</td></tr>
        <tr><td style="color: #64748B; padding: 6px 0;">End Date</td><td style="color: #1E293B; font-weight: 600; text-align: right;">${new Date(endDate).toLocaleDateString()}</td></tr>
        <tr style="border-top: 2px solid #BFDBFE;"><td style="color: #1D4ED8; padding: 10px 0; font-weight: 700;">Total</td><td style="color: #1D4ED8; font-weight: 700; text-align: right; font-size: 18px;">₹${totalAmount}</td></tr>
      </table>
    </div>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.CLIENT_URL}/bookings" style="background: #1D4ED8; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">View Bookings</a>
    </div>
  `);

/** 5b. Booking confirmed — sent to owner */
export const bookingConfirmedOwnerEmail = (ownerName, carTitle, userName, startDate, endDate, totalAmount) =>
  wrapTemplate(`
    <h2 style="color: #1E293B; margin-top: 0;">New Booking Received! 📦</h2>
    <p style="color: #475569; line-height: 1.6;">Hi ${ownerName}, you have a new booking for your car!</p>
    <div style="background: #EFF6FF; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="color: #64748B; padding: 6px 0;">Car</td><td style="color: #1E293B; font-weight: 600; text-align: right;">${carTitle}</td></tr>
        <tr><td style="color: #64748B; padding: 6px 0;">Customer</td><td style="color: #1E293B; font-weight: 600; text-align: right;">${userName}</td></tr>
        <tr><td style="color: #64748B; padding: 6px 0;">Dates</td><td style="color: #1E293B; font-weight: 600; text-align: right;">${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}</td></tr>
        <tr style="border-top: 2px solid #BFDBFE;"><td style="color: #1D4ED8; padding: 10px 0; font-weight: 700;">Amount</td><td style="color: #1D4ED8; font-weight: 700; text-align: right; font-size: 18px;">₹${totalAmount}</td></tr>
      </table>
    </div>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.CLIENT_URL}/owner/bookings" style="background: #1D4ED8; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">View Bookings</a>
    </div>
  `);

/** 6. Booking cancelled */
export const bookingCancelledEmail = (name, carTitle, reason) =>
  wrapTemplate(`
    <h2 style="color: #1E293B; margin-top: 0;">Booking Cancelled ❌</h2>
    <p style="color: #475569; line-height: 1.6;">Hi ${name}, a booking for <strong>${carTitle}</strong> has been cancelled.</p>
    ${reason ? `
    <div style="background: #FEF2F2; padding: 16px; border-radius: 8px; border-left: 4px solid #DC2626; margin: 20px 0;">
      <p style="color: #1E293B; margin: 0; font-weight: 600;">Reason:</p>
      <p style="color: #475569; margin: 8px 0 0;">${reason}</p>
    </div>
    ` : ''}
    <p style="color: #475569; line-height: 1.6;">If a payment was made, the refund will be processed to your original payment method within 5-10 business days.</p>
  `);

/** 7. Payment receipt */
export const paymentReceiptEmail = (name, carTitle, breakdown) =>
  wrapTemplate(`
    <h2 style="color: #1E293B; margin-top: 0;">Payment Receipt 💳</h2>
    <p style="color: #475569; line-height: 1.6;">Hi ${name}, here is your payment receipt for <strong>${carTitle}</strong>.</p>
    <div style="background: #EFF6FF; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="color: #64748B; padding: 6px 0;">Rental (${breakdown.totalDays} days)</td><td style="color: #1E293B; font-weight: 600; text-align: right;">₹${breakdown.subtotal}</td></tr>
        <tr><td style="color: #64748B; padding: 6px 0;">Platform Fee (${breakdown.commissionPercent}%)</td><td style="color: #1E293B; font-weight: 600; text-align: right;">₹${breakdown.commission}</td></tr>
        ${breakdown.damageDeposit > 0 ? `<tr><td style="color: #64748B; padding: 6px 0;">Damage Deposit (refundable)</td><td style="color: #1E293B; font-weight: 600; text-align: right;">₹${breakdown.damageDeposit}</td></tr>` : ''}
        <tr style="border-top: 2px solid #BFDBFE;"><td style="color: #1D4ED8; padding: 10px 0; font-weight: 700; font-size: 16px;">Total Paid</td><td style="color: #1D4ED8; font-weight: 700; text-align: right; font-size: 20px;">₹${breakdown.totalAmount}</td></tr>
      </table>
    </div>
    <p style="color: #94A3B8; font-size: 13px;">Keep this email as your payment confirmation.</p>
  `);

/** 8. Password reset link */
export const passwordResetEmail = (name, resetUrl) =>
  wrapTemplate(`
    <h2 style="color: #1E293B; margin-top: 0;">Password Reset Request 🔐</h2>
    <p style="color: #475569; line-height: 1.6;">Hi ${name}, we received a request to reset your password.</p>
    <p style="color: #475569; line-height: 1.6;">Click the button below to set a new password. This link expires in 1 hour.</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" style="background: #1D4ED8; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Reset Password</a>
    </div>
    <p style="color: #94A3B8; font-size: 13px;">If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
    <p style="color: #94A3B8; font-size: 12px;">If the button doesn't work, copy this link: ${resetUrl}</p>
  `);

/** 9. Admin deleted a car listing — notification to owner */
export const carDeletedByAdminEmail = (ownerName, carTitle) =>
  wrapTemplate(`
    <h2 style="color: #1E293B; margin-top: 0;">Listing Removed ⚠️</h2>
    <p style="color: #475569; line-height: 1.6;">Hi ${ownerName}, your car listing <strong>"${carTitle}"</strong> has been removed by the MotoLease admin team.</p>
    <div style="background: #FEF2F2; padding: 16px; border-radius: 8px; border-left: 4px solid #D97706; margin: 20px 0;">
      <p style="color: #1E293B; margin: 0;">This action was taken due to a policy violation or a reported issue. If you believe this was a mistake, please contact our support team.</p>
    </div>
  `);

/** 10. Account suspended notification */
export const accountSuspendedEmail = (name) =>
  wrapTemplate(`
    <h2 style="color: #1E293B; margin-top: 0;">Account Suspended ⛔</h2>
    <p style="color: #475569; line-height: 1.6;">Hi ${name}, your MotoLease account has been suspended by the admin team.</p>
    <div style="background: #FEF2F2; padding: 16px; border-radius: 8px; border-left: 4px solid #DC2626; margin: 20px 0;">
      <p style="color: #1E293B; margin: 0;">You will not be able to log in or access the platform while your account is suspended. If you believe this was an error, please contact our support team.</p>
    </div>
  `);

/** 11. Deposit refund approved */
export const depositRefundApprovedEmail = (userName, carTitle, amount) =>
  wrapTemplate(`
    <h2 style="color: #1E293B; margin-top: 0;">Deposit Refund Processed 💸</h2>
    <p style="color: #475569; line-height: 1.6;">Hi ${userName},</p>
    <p style="color: #475569; line-height: 1.6;">Great news! Your damage deposit of <strong>₹${amount}</strong> for your rental of <strong>${carTitle}</strong> has been successfully processed.</p>
    <p style="color: #475569; line-height: 1.6;">The funds have been returned to your original payment method. Depending on your bank, it may take 5-7 business days for the credit to appear on your statement.</p>
    <p style="color: #475569; line-height: 1.6;">Thank you for driving with MotoLease!</p>
  `);

/** 12. Deposit refund denied */
export const depositRefundDeniedEmail = (userName, carTitle) =>
  wrapTemplate(`
    <h2 style="color: #1E293B; margin-top: 0;">Deposit Refund Update ⚠️</h2>
    <p style="color: #475569; line-height: 1.6;">Hi ${userName},</p>
    <p style="color: #475569; line-height: 1.6;">We are writing regarding your recent return of the <strong>${carTitle}</strong>.</p>
    <p style="color: #475569; line-height: 1.6;">Unfortunately, your damage deposit refund has been denied due to reported damages or violations of our rental agreement during your trip.</p>
    <p style="color: #475569; line-height: 1.6;">If you have any questions or wish to dispute this decision, please contact us immediately.</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="mailto:motolease2026@gmail.com" style="background: #DC2626; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Contact Support</a>
    </div>
  `);
