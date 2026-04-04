// Email Service - SMTP Integration
// Configure with your SMTP provider (SendGrid, Postmark, Mailgun, etc.)

interface EmailConfig {
  to: string
  subject: string
  html: string
  from?: string
  replyTo?: string
}

interface SMTPConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}

// Get SMTP config from environment variables
function getSMTPConfig(): SMTPConfig | null {
  const host = process.env.SMTP_HOST
  const port = process.env.SMTP_PORT
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host || !port || !user || !pass) {
    return null
  }

  return {
    host,
    port: parseInt(port),
    secure: parseInt(port) === 465,
    auth: { user, pass }
  }
}

// Send email using fetch (works in Edge runtime)
export async function sendEmail(config: EmailConfig): Promise<{ success: boolean; error?: string }> {
  const smtpConfig = getSMTPConfig()
  
  // Default sender
  const from = config.from || process.env.SMTP_FROM || 'noreply@lethal-solutions.me'
  
  // If no SMTP configured, log and return success (for development)
  if (!smtpConfig) {
    console.log('[Email Service] SMTP not configured. Email would be sent to:', config.to)
    console.log('[Email Service] Subject:', config.subject)
    return { success: true }
  }

  try {
    // Using a generic SMTP API approach
    // For production, integrate with your specific provider's API:
    // - SendGrid: https://api.sendgrid.com/v3/mail/send
    // - Postmark: https://api.postmarkapp.com/email
    // - Mailgun: https://api.mailgun.net/v3/YOUR_DOMAIN/messages
    
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: config.to,
        from,
        subject: config.subject,
        html: config.html,
        replyTo: config.replyTo
      })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(error)
    }

    return { success: true }
  } catch (error) {
    console.error('[Email Service] Failed to send email:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send email' 
    }
  }
}

// Helper functions for common email types
export async function sendOrderConfirmation(
  email: string,
  data: {
    customerName: string
    orderId: string
    productName: string
    variant: string
    price: string
    licenseKey?: string
    downloadLink?: string
  }
) {
  const { orderConfirmationEmail } = await import('./email-templates')
  const template = orderConfirmationEmail(data)
  return sendEmail({ to: email, ...template })
}

export async function sendWelcomeEmail(
  email: string,
  data: { customerName: string }
) {
  const { welcomeEmail } = await import('./email-templates')
  const template = welcomeEmail({ ...data, email })
  return sendEmail({ to: email, ...template })
}

export async function sendPasswordResetEmail(
  email: string,
  data: { customerName: string; resetLink: string; expiresIn?: string }
) {
  const { passwordResetEmail } = await import('./email-templates')
  const template = passwordResetEmail({ ...data, expiresIn: data.expiresIn || '1 hour' })
  return sendEmail({ to: email, ...template })
}

export async function sendLicenseKey(
  email: string,
  data: {
    customerName: string
    orderId: string
    productName: string
    licenseKey: string
    instructions?: string
  }
) {
  const { licenseDeliveryEmail } = await import('./email-templates')
  const template = licenseDeliveryEmail(data)
  return sendEmail({ to: email, ...template })
}

export async function sendOrderStatusUpdate(
  email: string,
  data: {
    customerName: string
    orderId: string
    productName: string
    status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded' | 'confirmed'
    message?: string
  }
) {
  const { orderStatusEmail } = await import('./email-templates')
  const template = orderStatusEmail(data)
  return sendEmail({ to: email, ...template })
}
