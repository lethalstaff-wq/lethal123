"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"

export function LegalModals() {
  const [tosOpen, setTosOpen] = useState(false)
  const [privacyOpen, setPrivacyOpen] = useState(false)

  return (
    <>
      {/* TOS Modal */}
      <Dialog open={tosOpen} onOpenChange={setTosOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Terms of Service</DialogTitle>
            <DialogDescription>Last updated: January 2025</DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-4 text-sm text-muted-foreground">
              <section>
                <h3 className="font-bold text-foreground mb-2">1. No Refunds Policy</h3>
                <p>All sales are final. Digital products are provided as-is. No refunds are issued under any circumstances. Understand the terms before purchase.</p>
              </section>
              <section>
                <h3 className="font-bold text-foreground mb-2">2. Virtual Goods</h3>
                <p>Products provided are virtual goods and digital licenses. Once activated, they cannot be transferred, sold, or resold. License is personal and non-transferable.</p>
              </section>
              <section>
                <h3 className="font-bold text-foreground mb-2">3. Account Safety</h3>
                <p>You are responsible for protecting your account credentials. We are not liable for unauthorized access or account compromise. Use strong, unique passwords. Enable account security features immediately after purchase.</p>
              </section>
              <section>
                <h3 className="font-bold text-foreground mb-2">4. Usage Terms</h3>
                <p>Products are provided for authorized use only. Violation of game ToS or applicable laws may result in account suspension or ban. We cannot provide assistance if your account is banned.</p>
              </section>
              <section>
                <h3 className="font-bold text-foreground mb-2">5. Limitation of Liability</h3>
                <p>We are not responsible for any loss, damage, or consequences resulting from the use of our products, including but not limited to account bans, VAC bans, or other punitive measures.</p>
              </section>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Privacy Policy Modal */}
      <Dialog open={privacyOpen} onOpenChange={setPrivacyOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Privacy Policy</DialogTitle>
            <DialogDescription>Last updated: January 2025</DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-4 text-sm text-muted-foreground">
              <section>
                <h3 className="font-bold text-foreground mb-2">1. Information We Collect</h3>
                <p>We collect email addresses, payment information, and basic usage data. This information is used solely for account management and service delivery.</p>
              </section>
              <section>
                <h3 className="font-bold text-foreground mb-2">2. Data Privacy</h3>
                <p>Your personal data is encrypted and stored securely. We do not sell, trade, or share your information with third parties for marketing purposes.</p>
              </section>
              <section>
                <h3 className="font-bold text-foreground mb-2">3. Cookies & Tracking</h3>
                <p>We use essential cookies for site functionality and analytics. Tracking is minimal and used only to improve our service.</p>
              </section>
              <section>
                <h3 className="font-bold text-foreground mb-2">4. GDPR Compliance</h3>
                <p>If you're in the EU, your data is handled in accordance with GDPR. You have the right to request, modify, or delete your data.</p>
              </section>
              <section>
                <h3 className="font-bold text-foreground mb-2">5. Data Retention</h3>
                <p>Personal data is retained for as long as your account is active. Upon account deletion, data is purged within 30 days.</p>
              </section>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Return render functions for use */}
      <div className="hidden">
        <button onClick={() => setTosOpen(true)}>TOS</button>
        <button onClick={() => setPrivacyOpen(true)}>Privacy</button>
      </div>
    </>
  )
}

export function useOpenTos() {
  const [, setTosOpen] = useState(false)
  return () => setTosOpen(true)
}

export function useOpenPrivacy() {
  const [, setPrivacyOpen] = useState(false)
  return () => setPrivacyOpen(true)
}
