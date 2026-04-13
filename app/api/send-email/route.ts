import { NextRequest, NextResponse } from 'next/server'
import {
  generateOrderConfirmationEmail,
  generateWelcomeEmail,
  generatePasswordResetEmail,
  generateLicenseDeliveryEmail,
  generateOrderStatusEmail,
  generateRenewalReminderEmail,
} from '@/lib/email-templates'

// Email sending API route
// Supports both raw emails and template-based emails

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    let { to, from, subject, html, replyTo, type, data } = body

    console.log("[v0] Email API called:", { to, type, hasData: !!data })
    console.log("[v0] RESEND_API_KEY exists:", !!process.env.RESEND_API_KEY)

    // If using template-based email
    if (type && data) {
      switch (type) {
        case 'order_confirmation':
          const orderEmail = generateOrderConfirmationEmail(data)
          subject = orderEmail.subject
          html = orderEmail.html
          break
        case 'welcome':
          const welcomeEmail = generateWelcomeEmail(data)
          subject = welcomeEmail.subject
          html = welcomeEmail.html
          break
        case 'password_reset':
          const resetEmail = generatePasswordResetEmail(data)
          subject = resetEmail.subject
          html = resetEmail.html
          break
        case 'license_delivery':
          const licenseEmail = generateLicenseDeliveryEmail(data)
          subject = licenseEmail.subject
          html = licenseEmail.html
          break
        case 'order_status':
          const statusEmail = generateOrderStatusEmail(data)
          subject = statusEmail.subject
          html = statusEmail.html
          break
        case 'renewal_reminder':
          const renewalEmail = generateRenewalReminderEmail(data)
          subject = renewalEmail.subject
          html = renewalEmail.html
          break
        default:
          return NextResponse.json({ error: 'Unknown email type' }, { status: 400 })
      }
    }

    // Validate required fields
    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, html (or type and data)' },
        { status: 400 }
      )
    }

    // Check for SMTP configuration
    const smtpHost = process.env.SMTP_HOST
    const smtpPort = process.env.SMTP_PORT
    const smtpUser = process.env.SMTP_USER
    const smtpPass = process.env.SMTP_PASS

    // If using SendGrid
    if (process.env.SENDGRID_API_KEY) {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: { email: from || 'noreply@lethal-solutions.me' },
          subject,
          content: [{ type: 'text/html', value: html }],
          reply_to: replyTo ? { email: replyTo } : undefined
        })
      })

      if (!response.ok) {
        const error = await response.text()
        console.error('[SendGrid] Error:', error)
        return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    // If using Postmark
    if (process.env.POSTMARK_API_KEY) {
      const response = await fetch('https://api.postmarkapp.com/email', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Postmark-Server-Token': process.env.POSTMARK_API_KEY
        },
        body: JSON.stringify({
          From: from || 'noreply@lethal-solutions.me',
          To: to,
          Subject: subject,
          HtmlBody: html,
          ReplyTo: replyTo
        })
      })

      if (!response.ok) {
        const error = await response.text()
        console.error('[Postmark] Error:', error)
        return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    // If using Mailgun
    if (process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN) {
      const formData = new FormData()
      formData.append('from', from || 'noreply@lethal-solutions.me')
      formData.append('to', to)
      formData.append('subject', subject)
      formData.append('html', html)
      if (replyTo) formData.append('h:Reply-To', replyTo)

      const response = await fetch(
        `https://api.mailgun.net/v3/${process.env.MAILGUN_DOMAIN}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${Buffer.from(`api:${process.env.MAILGUN_API_KEY}`).toString('base64')}`
          },
          body: formData
        }
      )

      if (!response.ok) {
        const error = await response.text()
        console.error('[Mailgun] Error:', error)
        return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    // If using Resend
    if (process.env.RESEND_API_KEY) {
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@lethalsolutions.me'
      const fromName = process.env.RESEND_FROM_NAME || 'Lethal Solutions'
      
      console.log("[v0] Sending via Resend:", { fromEmail, fromName, to, subject })
      
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: `${fromName} <${fromEmail}>`,
          to: [to],
          subject,
          html,
          reply_to: replyTo || 'support@lethalsolutions.me'
        })
      })

      if (!response.ok) {
        const error = await response.text()
        console.error('[v0] Resend Error:', error)
        return NextResponse.json({ error: 'Failed to send email', details: error }, { status: 500 })
      }

      const result = await response.json()
      console.log("[v0] Resend success:", result)
      return NextResponse.json({ success: true, id: result.id })
    }

    // No email provider configured - log for development
    console.log('[Email API] No email provider configured')
    console.log('[Email API] Would send to:', to)
    console.log('[Email API] Subject:', subject)
    
    // Return success in development mode
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({ success: true, warning: 'Email logged (no provider configured)' })
    }

    return NextResponse.json(
      { error: 'No email provider configured. Set SENDGRID_API_KEY, POSTMARK_API_KEY, MAILGUN_API_KEY, or RESEND_API_KEY.' },
      { status: 500 }
    )

  } catch (error) {
    console.error('[Email API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
