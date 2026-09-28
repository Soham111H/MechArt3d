/**
 * Email Templates for MechArt 3D
 * Standard layout: White background, blue (#1D4ED8) header, Inter font.
 */

const baseTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Inter', Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }
    .container { max-w-md mx-auto bg-white rounded-xl overflow-hidden shadow-sm margin: 20px auto; max-width: 600px; }
    .header { background-color: #1D4ED8; padding: 30px 20px; text-align: center; color: white; }
    .content { padding: 30px; color: #334155; line-height: 1.6; }
    .footer { background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
    .btn { display: inline-block; background-color: #1D4ED8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin:0; font-size: 24px;">MechArt 3D</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} MechArt 3D. All rights reserved.</p>
      <p>Where Fundamental binds with the Artistic and brings the product to exist.</p>
    </div>
  </div>
</body>
</html>
`;

export const getTemplate = {
  // 1. WELCOME
  welcome: (name: string, coupon: string) => baseTemplate(`
    <h2>Welcome to MechArt 3D, ${name}! 🎉</h2>
    <p>We're thrilled to have you join our community of creators and innovators.</p>
    <p>As a welcome gift, use code <strong>${coupon}</strong> for 10% off your first order!</p>
    <div style="text-align: center;">
      <a href="https://mechart3d.com" class="btn">Start Shopping</a>
    </div>
  `),

  // 2. EMAIL VERIFICATION
  verification: (link: string, otp: string) => baseTemplate(`
    <h2>Verify your email address</h2>
    <p>Please use the following 6-digit code to verify your account:</p>
    <h1 style="letter-spacing: 5px; text-align: center; background: #f1f5f9; padding: 15px; border-radius: 8px;">${otp}</h1>
    <p>Or click the button below to verify instantly (expires in 24 hours):</p>
    <div style="text-align: center;">
      <a href="${link}" class="btn">Verify Email</a>
    </div>
  `),

  // 3. LOGIN SUCCESS ALERT
  loginAlert: (device: string, location: string, ip: string, time: string) => baseTemplate(`
    <h2>New login to your account</h2>
    <p>We noticed a new login to your MechArt 3D account.</p>
    <ul style="background: #f1f5f9; padding: 15px 30px; border-radius: 8px;">
      <li><strong>Device:</strong> ${device}</li>
      <li><strong>Location:</strong> ${location}</li>
      <li><strong>IP:</strong> ${ip}</li>
      <li><strong>Time:</strong> ${time}</li>
    </ul>
    <p style="color: #ef4444; font-weight: bold;">Not you?</p>
    <p>If you didn't authorize this login, please secure your account immediately.</p>
    <div style="text-align: center;">
      <a href="https://mechart3d.com/account/security" class="btn" style="background-color: #ef4444;">Secure Account</a>
    </div>
  `),

  // 4. NEW DEVICE LOGIN
  newDeviceAlert: (device: string) => baseTemplate(`
    <h2 style="color: #ef4444;">⚠️ New device recognized</h2>
    <p>Your account was just accessed from an unrecognized device: <strong>${device}</strong>.</p>
    <div style="text-align: center;">
      <a href="https://mechart3d.com/account/security/revoke" class="btn" style="background-color: #ef4444;">This wasn't me</a>
    </div>
  `),

  // 5. PASSWORD RESET
  passwordReset: (link: string, otp: string) => baseTemplate(`
    <h2>Reset your password</h2>
    <p>We received a request to reset your password. Use the code below:</p>
    <h1 style="letter-spacing: 5px; text-align: center; background: #f1f5f9; padding: 15px; border-radius: 8px;">${otp}</h1>
    <p>Or click the button (valid for 1 hour):</p>
    <div style="text-align: center;">
      <a href="${link}" class="btn">Reset Password</a>
    </div>
    <p style="font-size: 12px; color: #94a3b8; margin-top: 20px;">Didn't request this? You can safely ignore this email.</p>
  `),

  // 6. PASSWORD CHANGED
  passwordChanged: (time: string) => baseTemplate(`
    <h2>Password Updated</h2>
    <p>Your password was successfully changed at ${time}.</p>
    <p style="color: #ef4444;">If you did not make this change, please contact support immediately!</p>
  `),

  // 7. ORDER CONFIRMATION
  orderConfirmation: (orderId: string, items: unknown[], total: string) => baseTemplate(`
    <h2>Order Confirmed! #${orderId}</h2>
    <p>Thank you for your purchase. We are getting your order ready to be shipped.</p>
    <div style="background: #f1f5f9; padding: 15px; border-radius: 8px;">
      <h3>Total: ${total}</h3>
    </div>
    <div style="text-align: center;">
      <a href="https://mechart3d.com/account/orders/${orderId}" class="btn">View Order</a>
    </div>
  `),

  // 8. ORDER STATUS UPDATE
  orderStatus: (orderId: string, status: string) => baseTemplate(`
    <h2>Update on Order #${orderId}</h2>
    <p>Your order is now: <strong>${status}</strong>.</p>
    <div style="text-align: center;">
      <a href="https://mechart3d.com/account/orders/${orderId}" class="btn">Track Order</a>
    </div>
  `),

  // 9. SHIPPING NOTIFICATION
  shipping: (orderId: string, tracking: string, courier: string) => baseTemplate(`
    <h2>🚚 Your order is on its way!</h2>
    <p>Order #${orderId} has been shipped via ${courier}.</p>
    <p>Tracking Number: <strong>${tracking}</strong></p>
    <div style="text-align: center;">
      <a href="https://mechart3d.com/account/orders/${orderId}" class="btn">Track Package</a>
    </div>
  `),

  // 10. REFUND CONFIRMATION
  refund: (orderId: string, amount: string) => baseTemplate(`
    <h2>Refund Processed</h2>
    <p>We have processed a refund of <strong>${amount}</strong> for order #${orderId}.</p>
    <p>Please allow 5-7 business days for the funds to appear in your account.</p>
  `),

  // 11. CUSTOM REQUEST RECEIVED
  customRequestReceived: (reqId: string) => baseTemplate(`
    <h2>Custom Design Request Received!</h2>
    <p>Thank you for submitting a custom request (#${reqId}). Our team is reviewing the details.</p>
    <p>You can expect a quote within 24-48 hours.</p>
  `),

  // 12. QUOTE SENT
  quoteSent: (reqId: string, price: string) => baseTemplate(`
    <h2>Your Custom Quote is Ready!</h2>
    <p>We have reviewed request #${reqId} and prepared a quote of <strong>${price}</strong>.</p>
    <p>Please review the details on your dashboard. This quote is valid for 7 days.</p>
    <div style="text-align: center;">
      <a href="https://mechart3d.com/account/requests/${reqId}" class="btn">Accept & Pay</a>
    </div>
  `),

  // 13. ACCOUNT BANNED
  accountBanned: (reason: string) => baseTemplate(`
    <h2 style="color: #ef4444;">Important Notice</h2>
    <p>Your account has been suspended due to violations of our Terms of Service.</p>
    <p>Reason: ${reason}</p>
    <p>If you believe this is an error, please contact support.</p>
  `),

  // 14. BIRTHDAY DISCOUNT
  birthday: (name: string) => baseTemplate(`
    <h2>🎂 Happy Birthday, ${name}!</h2>
    <p>We hope you have a fantastic day! Here is a special gift from us to you.</p>
    <p>Use code <strong>BDAY15</strong> for 15% off your next purchase! (Valid for 7 days)</p>
  `),

  // 15. WISHLIST ON SALE
  wishlistSale: (productName: string, discount: string) => baseTemplate(`
    <h2>🔥 A product you love is on sale!</h2>
    <p><strong>${productName}</strong> from your wishlist is now ${discount} off.</p>
    <div style="text-align: center;">
      <a href="https://mechart3d.com/wishlist" class="btn">Buy Now</a>
    </div>
  `),

  // 16. ABANDONED CART
  abandonedCart: (name: string) => baseTemplate(`
    <h2>You left something behind, ${name}... 👀</h2>
    <p>We noticed you added some great items to your cart but didn't check out.</p>
    <p>Complete your purchase now before they sell out!</p>
    <div style="text-align: center;">
      <a href="https://mechart3d.com/cart" class="btn">Return to Cart</a>
    </div>
  `)
};
