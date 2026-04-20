"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import {
  User as UserIcon, Mail, Shield, Lock, Eye, EyeOff, Loader2, Save, Check,
  Bell, AlertTriangle, Trash2, MessageSquare, LogOut,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { updateProfilePreferences, deleteMyAccount } from "@/app/profile/actions"
import { cn } from "@/lib/utils"

interface ProfileRow {
  id: string
  email: string
  display_name: string | null
  discord_username: string | null
  notify_order_updates: boolean
  notify_promotions: boolean
  notify_renewal_reminders: boolean
  notify_product_updates: boolean
}

export function ProfileSettings({ profile, onLogout }: { profile: ProfileRow; onLogout: () => void }) {
  const supabase = createClient()
  const [isPending, startTransition] = useTransition()

  // Basic info
  const [displayName, setDisplayName] = useState(profile.display_name ?? "")
  const [discord, setDiscord] = useState(profile.discord_username ?? "")

  // Email change
  const [newEmail, setNewEmail] = useState("")
  const [emailSent, setEmailSent] = useState(false)

  // Password
  const [showPw, setShowPw] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Notifications
  const [notifyOrders, setNotifyOrders] = useState(profile.notify_order_updates)
  const [notifyPromos, setNotifyPromos] = useState(profile.notify_promotions)
  const [notifyRenewals, setNotifyRenewals] = useState(profile.notify_renewal_reminders)
  const [notifyProduct, setNotifyProduct] = useState(profile.notify_product_updates)

  // Delete
  const [showDelete, setShowDelete] = useState(false)
  const [deleteEmail, setDeleteEmail] = useState("")

  function saveBasics() {
    startTransition(async () => {
      try {
        await updateProfilePreferences({
          display_name: displayName.trim() || null,
          discord_username: discord.trim() || null,
        })
        toast.success("Profile updated")
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Update failed")
      }
    })
  }

  async function saveEmail() {
    if (!newEmail.includes("@")) { toast.error("Enter a valid email"); return }
    const { error } = await supabase.auth.updateUser({ email: newEmail.trim() })
    if (error) toast.error(error.message)
    else { setEmailSent(true); toast.success("Confirmation email sent") }
  }

  async function savePassword() {
    if (newPassword.length < 8) { toast.error("Password must be at least 8 characters"); return }
    if (newPassword !== confirmPassword) { toast.error("Passwords don't match"); return }
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) toast.error(error.message)
    else {
      toast.success("Password updated")
      setNewPassword(""); setConfirmPassword("")
    }
  }

  function saveNotifications() {
    startTransition(async () => {
      try {
        await updateProfilePreferences({
          notify_order_updates: notifyOrders,
          notify_promotions: notifyPromos,
          notify_renewal_reminders: notifyRenewals,
          notify_product_updates: notifyProduct,
        })
        toast.success("Preferences saved")
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Save failed")
      }
    })
  }

  function doDelete() {
    startTransition(async () => {
      try {
        await deleteMyAccount(deleteEmail)
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Delete failed")
      }
    })
  }

  return (
    <div className="space-y-5">
      {/* ─── Basic info ─── */}
      <SettingsSection title="Personal info" icon={UserIcon} description="Visible to our support team on your orders.">
        <Field label="Display name">
          <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="How should we call you?" />
        </Field>
        <Field label="Discord username" icon={MessageSquare}>
          <Input value={discord} onChange={(e) => setDiscord(e.target.value)} placeholder="username#0000" />
        </Field>
        <SaveRow onSave={saveBasics} pending={isPending} />
      </SettingsSection>

      {/* ─── Email ─── */}
      <SettingsSection title="Email address" icon={Mail} description="We'll send a confirmation link to the new address before switching.">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
          <Mail className="h-4 w-4 text-white/55" />
          <span className="text-sm text-white/80 flex-1">{profile.email}</span>
          <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
            <Shield className="h-3 w-3" /> Verified
          </span>
        </div>
        <div className="mt-4">
          <Field label="New email">
            <Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="new@example.com" disabled={emailSent} />
          </Field>
          {emailSent ? (
            <div className="flex items-center gap-2 mt-3 text-xs text-emerald-400">
              <Check className="h-3.5 w-3.5" /> Confirmation link sent. Check {newEmail} to finalize the change.
            </div>
          ) : (
            <button
              onClick={saveEmail}
              disabled={!newEmail}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] disabled:opacity-40 text-sm font-semibold text-white transition-colors"
            >
              <Save className="h-3.5 w-3.5" /> Send confirmation
            </button>
          )}
        </div>
      </SettingsSection>

      {/* ─── Password ─── */}
      <SettingsSection title="Password" icon={Lock} description="Use at least 8 characters. We recommend a password manager.">
        <Field label="New password">
          <div className="relative">
            <Input type={showPw ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" />
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-white/55 hover:text-white"
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </Field>
        <Field label="Confirm new password">
          <Input type={showPw ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" />
        </Field>
        <button
          onClick={savePassword}
          disabled={!newPassword || !confirmPassword}
          className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] disabled:opacity-40 text-sm font-semibold text-white transition-colors"
        >
          <Save className="h-3.5 w-3.5" /> Update password
        </button>
      </SettingsSection>

      {/* ─── Notifications ─── */}
      <SettingsSection title="Notifications" icon={Bell} description="Pick what lands in your inbox.">
        <div className="space-y-2">
          <Toggle
            label="Order updates"
            description="Order confirmations, license keys, shipping updates"
            checked={notifyOrders}
            onChange={setNotifyOrders}
            required
          />
          <Toggle
            label="Renewal reminders"
            description="3-day heads up before a license expires (if you opted in at checkout)"
            checked={notifyRenewals}
            onChange={setNotifyRenewals}
          />
          <Toggle
            label="Product updates"
            description="Patch notes and new features for products you own"
            checked={notifyProduct}
            onChange={setNotifyProduct}
          />
          <Toggle
            label="Promotions"
            description="Seasonal discounts, coupon drops, loyalty perks"
            checked={notifyPromos}
            onChange={setNotifyPromos}
          />
        </div>
        <SaveRow onSave={saveNotifications} pending={isPending} label="Save preferences" />
      </SettingsSection>

      {/* ─── Sign out ─── */}
      <button
        onClick={onLogout}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-white/[0.06] bg-white/[0.02] text-white/60 hover:text-white hover:bg-white/[0.04] transition-colors text-sm font-medium"
      >
        <LogOut className="h-4 w-4" /> Sign out of this device
      </button>

      {/* ─── Danger zone ─── */}
      <SettingsSection
        title="Danger zone"
        icon={AlertTriangle}
        description="Deleting your account is permanent. Orders, licenses, and preferences will be removed."
        tone="danger"
      >
        {!showDelete ? (
          <button
            onClick={() => setShowDelete(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500/30 bg-red-500/[0.05] hover:bg-red-500/[0.1] text-sm font-semibold text-red-400 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete my account
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-white/50 leading-relaxed">
              To confirm, type your email <span className="font-mono text-white/80">{profile.email}</span> below. This cannot be undone.
            </p>
            <Input
              value={deleteEmail}
              onChange={(e) => setDeleteEmail(e.target.value)}
              placeholder={profile.email}
              className="border-red-500/30 focus-visible:ring-red-500/40"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={doDelete}
                disabled={isPending || deleteEmail.trim().toLowerCase() !== profile.email.toLowerCase()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 disabled:opacity-40 text-sm font-bold text-red-400 transition-colors"
              >
                {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                Permanently delete
              </button>
              <button
                onClick={() => { setShowDelete(false); setDeleteEmail("") }}
                className="px-4 py-2 rounded-xl text-sm text-white/50 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </SettingsSection>
    </div>
  )
}

function SettingsSection({
  title,
  icon: Icon,
  description,
  tone = "default",
  children,
}: {
  title: string
  icon: typeof UserIcon
  description?: string
  tone?: "default" | "danger"
  children: React.ReactNode
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border p-5 md:p-6",
        tone === "danger"
          ? "border-red-500/15 bg-red-500/[0.02]"
          : "border-white/[0.06] bg-white/[0.012]"
      )}
    >
      <div className="flex items-start gap-3 mb-5">
        <div
          className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
            tone === "danger" ? "bg-red-500/15 text-red-400" : "bg-white/[0.04] text-white/60"
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">{title}</h3>
          {description && <p className="text-xs text-white/45 mt-0.5 leading-relaxed">{description}</p>}
        </div>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

function Field({ label, icon: Icon, children }: { label: string; icon?: typeof UserIcon; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[11px] font-semibold uppercase tracking-wider text-white/50 mb-1.5 flex items-center gap-1.5">
        {Icon && <Icon className="h-3 w-3" />} {label}
      </label>
      {children}
    </div>
  )
}

function SaveRow({ onSave, pending, label = "Save changes" }: { onSave: () => void; pending: boolean; label?: string }) {
  return (
    <div className="flex justify-end pt-1">
      <button
        onClick={onSave}
        disabled={pending}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#f97316] to-[#ea580c] hover:opacity-90 disabled:opacity-40 text-sm font-semibold text-white transition-opacity"
      >
        {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
        {label}
      </button>
    </div>
  )
}

function Toggle({
  label, description, checked, onChange, required,
}: { label: string; description?: string; checked: boolean; onChange: (v: boolean) => void; required?: boolean }) {
  return (
    <label className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/[0.02] cursor-pointer transition-colors">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => !required && onChange(!checked)}
        disabled={required}
        className={cn(
          "relative mt-0.5 h-6 w-11 rounded-full p-0.5 transition-colors shrink-0",
          checked ? "bg-[#f97316]" : "bg-white/[0.08]",
          required && "opacity-60 cursor-not-allowed"
        )}
      >
        <span
          className={cn(
            "block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200",
            checked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </button>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-white/90 flex items-center gap-2">
          {label}
          {required && <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-white/[0.08] text-white/50">Required</span>}
        </p>
        {description && <p className="text-xs text-white/55 mt-0.5 leading-relaxed">{description}</p>}
      </div>
    </label>
  )
}
