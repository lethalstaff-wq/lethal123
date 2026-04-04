// Email Templates for Lethal Solutions
// Beautiful, branded email templates

interface OrderConfirmationData {
  customerName?: string
  orderId: string
  productName?: string
  variant?: string
  price?: string
  licenseKey?: string
  downloadLink?: string
  items?: Array<{ name: string; variant: string; quantity: number; price: number }>
  total?: number
  paymentMethod?: string
}

interface WelcomeData {
  customerName: string
  email?: string
}

interface PasswordResetData {
  customerName: string
  resetLink: string
  expiresIn?: string
}

interface LicenseDeliveryData {
  customerName?: string
  orderId: string
  productName?: string
  licenseKey: string
  instructions?: string
  downloadLink?: string
}

interface OrderStatusData {
  customerName?: string
  orderId: string
  productName?: string
  status: 'pending' | 'processing' | 'completed' | 'cancelled'
  message?: string
}

const baseStyles = `
  body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0b; color: #fafafa; }
  .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
  .card { background: linear-gradient(145deg, #111113, #0d0d0f); border: 1px solid #1f1f23; border-radius: 16px; padding: 32px; margin-bottom: 24px; }
  .logo { font-size: 24px; font-weight: 800; color: #f97316; margin-bottom: 24px; }
  .heading { font-size: 28px; font-weight: 700; color: #fafafa; margin: 0 0 16px 0; }
  .subheading { font-size: 18px; font-weight: 600; color: #fafafa; margin: 0 0 12px 0; }
  .text { font-size: 15px; color: #a1a1aa; line-height: 1.6; margin: 0 0 16px 0; }
  .highlight { color: #f97316; font-weight: 600; }
  .button { display: inline-block; background: linear-gradient(135deg, #f97316, #ea580c); color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 600; font-size: 15px; }
  .divider { border: none; border-top: 1px solid #1f1f23; margin: 24px 0; }
  .footer { text-align: center; font-size: 13px; color: #52525b; margin-top: 32px; }
  .badge { display: inline-block; background: #f97316; color: #ffffff; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
  .info-box { background: #1c1c1f; border: 1px solid #27272a; border-radius: 12px; padding: 16px; margin: 16px 0; }
  .code { font-family: 'JetBrains Mono', monospace; background: #1c1c1f; border: 1px solid #f97316; border-radius: 8px; padding: 16px; font-size: 18px; letter-spacing: 2px; color: #f97316; text-align: center; }
`

const wrapHtml = (content: string, previewText: string = '') => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lethal Solutions</title>
  <style>${baseStyles}</style>
</head>
<body>
  <div style="display:none;max-height:0;overflow:hidden;">${previewText}</div>
  <div class="container">
    ${content}
    <div class="footer">
      <p>© ${new Date().getFullYear()} Lethal Solutions. All rights reserved.</p>
      <p style="margin-top: 8px;">
        <a href="https://lethal-solutions.me" style="color: #f97316; text-decoration: none;">Website</a> • 
        <a href="https://discord.gg/lethaldma" style="color: #f97316; text-decoration: none;">Discord</a>
      </p>
    </div>
  </div>
</body>
</html>
`

// Order Confirmation Email
export function generateOrderConfirmationEmail(data: OrderConfirmationData): { subject: string; html: string } {
  const itemsHtml = data.items?.map(item => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #1f1f23;">
        <strong style="color: #fafafa;">${item.name}</strong>
        <br><span style="color: #71717a; font-size: 13px;">${item.variant}</span>
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #1f1f23; text-align: center; color: #a1a1aa;">${item.quantity}x</td>
      <td style="padding: 12px 0; border-bottom: 1px solid #1f1f23; text-align: right; color: #f97316; font-weight: 600;">£${item.price.toFixed(2)}</td>
    </tr>
  `).join('') || ''

  const content = `
    <div class="card">
      <div class="logo">LETHAL SOLUTIONS</div>
      <span class="badge">Order Confirmed</span>
      <h1 class="heading" style="margin-top: 16px;">Thank you for your order!</h1>
      <p class="text">Your order <span class="highlight">#${data.orderId}</span> has been received and is being processed.</p>
      
      ${data.items ? `
      <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
        <thead>
          <tr style="border-bottom: 1px solid #1f1f23;">
            <th style="text-align: left; padding: 12px 0; color: #71717a; font-weight: 500;">Product</th>
            <th style="text-align: center; padding: 12px 0; color: #71717a; font-weight: 500;">Qty</th>
            <th style="text-align: right; padding: 12px 0; color: #71717a; font-weight: 500;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding: 16px 0; text-align: right; font-weight: 600; color: #fafafa;">Total:</td>
            <td style="padding: 16px 0; text-align: right; font-weight: 700; font-size: 18px; color: #f97316;">£${data.total?.toFixed(2) || '0.00'}</td>
          </tr>
        </tfoot>
      </table>
      ` : `
      <div class="info-box">
        <p style="margin: 0; color: #a1a1aa;"><strong style="color: #fafafa;">Product:</strong> ${data.productName || 'N/A'}</p>
        ${data.variant ? `<p style="margin: 8px 0 0; color: #a1a1aa;"><strong style="color: #fafafa;">Variant:</strong> ${data.variant}</p>` : ''}
        ${data.price ? `<p style="margin: 8px 0 0; color: #a1a1aa;"><strong style="color: #fafafa;">Price:</strong> <span class="highlight">${data.price}</span></p>` : ''}
      </div>
      `}
      
      <p class="text">Payment Method: <span class="highlight">${data.paymentMethod || 'Cryptocurrency'}</span></p>
      
      <hr class="divider">
      
      <p class="text">We'll send you another email with your license key once payment is confirmed. If you have any questions, please contact us on Discord.</p>
      
      <a href="https://lethal-solutions.me/track?order=${data.orderId}" class="button">Track Your Order</a>
    </div>
  `
  
  return {
    subject: `Order Confirmed - #${data.orderId}`,
    html: wrapHtml(content, `Your order #${data.orderId} has been confirmed!`)
  }
}

// Alias for admin page compatibility
export const orderConfirmationEmail = generateOrderConfirmationEmail

// Welcome Email
export function generateWelcomeEmail(data: WelcomeData): { subject: string; html: string } {
  const content = `
    <div class="card">
      <div class="logo">LETHAL SOLUTIONS</div>
      <h1 class="heading">Welcome to Lethal Solutions!</h1>
      <p class="text">Hey ${data.customerName},</p>
      <p class="text">Welcome to the elite. You've just joined the most trusted provider of premium gaming software.</p>
      
      <div class="info-box">
        <h3 class="subheading" style="margin-top: 0;">What's Next?</h3>
        <ul style="color: #a1a1aa; padding-left: 20px; margin: 0;">
          <li style="margin-bottom: 8px;">Browse our premium products</li>
          <li style="margin-bottom: 8px;">Join our Discord community for support</li>
          <li style="margin-bottom: 8px;">Check our guides for setup help</li>
        </ul>
      </div>
      
      <p class="text">If you have any questions, our support team is available 24/7 on Discord.</p>
      
      <a href="https://lethal-solutions.me/products" class="button">Browse Products</a>
    </div>
  `
  
  return {
    subject: `Welcome to Lethal Solutions, ${data.customerName}!`,
    html: wrapHtml(content, `Welcome to Lethal Solutions, ${data.customerName}!`)
  }
}

export const welcomeEmail = generateWelcomeEmail

// Password Reset Email
export function generatePasswordResetEmail(data: PasswordResetData): { subject: string; html: string } {
  const content = `
    <div class="card">
      <div class="logo">LETHAL SOLUTIONS</div>
      <h1 class="heading">Reset Your Password</h1>
      <p class="text">Hey ${data.customerName},</p>
      <p class="text">We received a request to reset your password. Click the button below to create a new password.</p>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="${data.resetLink}" class="button">Reset Password</a>
      </div>
      
      <div class="info-box">
        <p style="margin: 0; color: #a1a1aa; font-size: 13px;">
          <strong style="color: #fafafa;">⏰ This link expires in:</strong> ${data.expiresIn || '1 hour'}
        </p>
      </div>
      
      <p class="text" style="font-size: 13px;">If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.</p>
    </div>
  `
  
  return {
    subject: 'Reset Your Password - Lethal Solutions',
    html: wrapHtml(content, 'Password reset request for your Lethal Solutions account')
  }
}

export const passwordResetEmail = generatePasswordResetEmail

// License Delivery Email
export function generateLicenseDeliveryEmail(data: LicenseDeliveryData): { subject: string; html: string } {
  const content = `
    <div class="card">
      <div class="logo">LETHAL SOLUTIONS</div>
      <span class="badge" style="background: #22c55e;">License Ready</span>
      <h1 class="heading" style="margin-top: 16px;">Your License Key is Ready!</h1>
      <p class="text">Great news${data.customerName ? `, ${data.customerName}` : ''}! Your order <span class="highlight">#${data.orderId}</span> has been processed.</p>
      
      ${data.productName ? `<p class="text"><strong>Product:</strong> ${data.productName}</p>` : ''}
      
      <h3 class="subheading">Your License Key</h3>
      <div class="code">${data.licenseKey}</div>
      
      ${data.instructions ? `
      <div class="info-box" style="margin-top: 24px;">
        <h3 class="subheading" style="margin-top: 0;">Setup Instructions</h3>
        <p style="color: #a1a1aa; margin: 0; white-space: pre-line;">${data.instructions}</p>
      </div>
      ` : ''}
      
      <hr class="divider">
      
      <p class="text">Need help? Join our Discord for instant support from our team.</p>
      
      <a href="${data.downloadLink || 'https://lethal-solutions.me/downloads'}" class="button">Download Now</a>
    </div>
  `
  
  return {
    subject: `Your License Key for Order #${data.orderId}`,
    html: wrapHtml(content, `Your license key for order #${data.orderId} is ready!`)
  }
}

export const licenseDeliveryEmail = generateLicenseDeliveryEmail

// Order Status Update Email
export function generateOrderStatusEmail(data: OrderStatusData): { subject: string; html: string } {
  const statusConfig = {
    pending: { badge: 'Pending', color: '#eab308', message: 'Your order is awaiting payment confirmation.' },
    processing: { badge: 'Processing', color: '#3b82f6', message: 'Your order is being processed by our team.' },
    completed: { badge: 'Completed', color: '#22c55e', message: 'Your order has been completed successfully!' },
    cancelled: { badge: 'Cancelled', color: '#ef4444', message: 'Your order has been cancelled.' }
  }
  
  const status = statusConfig[data.status] || statusConfig.pending
  
  const content = `
    <div class="card">
      <div class="logo">LETHAL SOLUTIONS</div>
      <span class="badge" style="background: ${status.color};">${status.badge}</span>
      <h1 class="heading" style="margin-top: 16px;">Order Status Update</h1>
      <p class="text">Hey${data.customerName ? ` ${data.customerName}` : ''},</p>
      <p class="text">Your order <span class="highlight">#${data.orderId}</span> has been updated.</p>
      
      <div class="info-box">
        <p style="margin: 0; color: #a1a1aa;">
          <strong style="color: #fafafa;">Status:</strong> 
          <span style="color: ${status.color}; font-weight: 600;">${status.badge}</span>
        </p>
        ${data.productName ? `<p style="margin: 8px 0 0; color: #a1a1aa;"><strong style="color: #fafafa;">Product:</strong> ${data.productName}</p>` : ''}
      </div>
      
      <p class="text">${data.message || status.message}</p>
      
      <a href="https://lethal-solutions.me/track?order=${data.orderId}" class="button">View Order Details</a>
    </div>
  `
  
  return {
    subject: `Order #${data.orderId} - ${status.badge}`,
    html: wrapHtml(content, `Order #${data.orderId} status: ${status.badge}`)
  }
}

export const orderStatusEmail = generateOrderStatusEmail
