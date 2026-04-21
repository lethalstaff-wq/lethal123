"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Mail, Send, Eye, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  orderConfirmationEmail,
  welcomeEmail,
  passwordResetEmail,
  licenseDeliveryEmail,
  orderStatusEmail
} from "@/lib/email-templates"

const EMAIL_TEMPLATES = [
  { id: "order", name: "Order Confirmation", icon: "🧾" },
  { id: "welcome", name: "Welcome Email", icon: "👋" },
  { id: "reset", name: "Password Reset", icon: "🔐" },
  { id: "license", name: "License Delivery", icon: "🔑" },
  { id: "status", name: "Order Status Update", icon: "📦" },
]

export default function AdminEmailsPage() {
  const [selectedTemplate, setSelectedTemplate] = useState("order")
  const [previewHtml, setPreviewHtml] = useState("")
  const [testEmail, setTestEmail] = useState("")
  const [sending, setSending] = useState(false)
  const [copied, setCopied] = useState(false)

  const generatePreview = () => {
    let template: { subject: string; html: string }

    switch (selectedTemplate) {
      case "order":
        template = orderConfirmationEmail({
          customerName: "John",
          orderId: "LS-2024-001234",
          productName: "Streck DMA Cheat",
          variant: "30 Days",
          price: "£89.00",
          licenseKey: "XXXX-XXXX-XXXX-XXXX",
          downloadLink: "https://lethal-solutions.me/download/xxxxx"
        })
        break
      case "welcome":
        template = welcomeEmail({
          customerName: "John",
          email: "john@example.com"
        })
        break
      case "reset":
        template = passwordResetEmail({
          customerName: "John",
          resetLink: "https://lethal-solutions.me/reset?token=xxxxx",
          expiresIn: "1 hour"
        })
        break
      case "license":
        template = licenseDeliveryEmail({
          customerName: "John",
          orderId: "LS-2024-001234",
          productName: "Streck DMA Cheat",
          licenseKey: "XXXX-XXXX-XXXX-XXXX",
          instructions: "1. Download the loader\n2. Run as administrator\n3. Enter your license key\n4. Launch your game"
        })
        break
      case "status":
        template = orderStatusEmail({
          customerName: "John",
          orderId: "LS-2024-001234",
          productName: "Streck DMA Cheat",
          status: "completed",
          message: "Your order has been processed and your license key is ready."
        })
        break
      default:
        template = { subject: "", html: "" }
    }

    setPreviewHtml(template.html)
  }

  const sendTestEmail = async () => {
    if (!testEmail) return
    setSending(true)

    try {
      // Generate the template
      const template = orderConfirmationEmail({
        customerName: "Test User",
        orderId: "TEST-001",
        productName: "Test Product",
        variant: "30 Days",
        price: "£99.00",
        licenseKey: "TEST-XXXX-XXXX-XXXX"
      })

      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: testEmail,
          subject: `[TEST] ${template.subject}`,
          html: template.html
        })
      })

      if (response.ok) {
        alert('Test email sent!')
      } else {
        alert('Failed to send test email')
      }
    } catch {
      alert('Error sending test email')
    } finally {
      setSending(false)
    }
  }

  const copyHtml = () => {
    navigator.clipboard.writeText(previewHtml)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-transparent">
      <div className="container max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Email Templates</h1>
            <p className="text-white/55">Preview and test email templates</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Template Selector */}
          <div className="space-y-4">
            <div className="bg-white/[0.025] rounded-xl border p-4">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#f97316]" />
                Templates
              </h2>
              <div className="space-y-2">
                {EMAIL_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => {
                      setSelectedTemplate(template.id)
                      setPreviewHtml("")
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                      selectedTemplate === template.id
                        ? "bg-[#f97316]/10 border border-[#f97316]/30"
                        : "hover:bg-white/[0.04] border border-transparent"
                    }`}
                  >
                    <span className="text-xl">{template.icon}</span>
                    <span className="font-medium">{template.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white/[0.025] rounded-xl border p-4 space-y-4">
              <Button 
                onClick={generatePreview} 
                className="w-full"
              >
                <Eye className="h-4 w-4 mr-2" />
                Generate Preview
              </Button>

              {previewHtml && (
                <Button 
                  onClick={copyHtml} 
                  variant="outline" 
                  className="w-full"
                >
                  {copied ? (
                    <><Check className="h-4 w-4 mr-2" /> Copied!</>
                  ) : (
                    <><Copy className="h-4 w-4 mr-2" /> Copy HTML</>
                  )}
                </Button>
              )}
            </div>

            {/* Test Email */}
            <div className="bg-white/[0.025] rounded-xl border p-4 space-y-4">
              <h2 className="font-semibold flex items-center gap-2">
                <Send className="h-4 w-4 text-[#f97316]" />
                Send Test Email
              </h2>
              <div className="space-y-2">
                <Label htmlFor="testEmail">Email Address</Label>
                <Input
                  id="testEmail"
                  type="email"
                  placeholder="test@example.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                />
              </div>
              <Button 
                onClick={sendTestEmail} 
                disabled={!testEmail || sending}
                variant="outline"
                className="w-full"
              >
                {sending ? "Sending..." : "Send Test"}
              </Button>
              <p className="text-xs text-white/55">
                Requires SMTP configuration (SENDGRID_API_KEY, RESEND_API_KEY, etc.)
              </p>
            </div>
          </div>

          {/* Preview */}
          <div className="lg:col-span-2">
            <div className="bg-white/[0.025] rounded-xl border overflow-hidden">
              <div className="p-4 border-b flex items-center justify-between">
                <h2 className="font-semibold">Email Preview</h2>
                <span className="text-xs text-white/55">
                  {EMAIL_TEMPLATES.find(t => t.id === selectedTemplate)?.name}
                </span>
              </div>
              <div className="bg-[#050505] min-h-[600px]">
                {previewHtml ? (
                  <iframe
                    srcDoc={previewHtml}
                    className="w-full h-[700px] border-0"
                    title="Email Preview"
                  />
                ) : (
                  <div className="flex items-center justify-center h-[600px] text-white/55">
                    Click &quot;Generate Preview&quot; to see the email template
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
