"use client"

import { useState, useTransition } from "react"
import { updateUserAdmin, deleteUser } from "@/app/admin/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users, Search, Shield, ShieldOff, Trash2, Loader2, AlertCircle, Copy, Check } from "lucide-react"
import { useRouter } from "next/navigation"

type User = {
  id: string
  email: string
  is_admin: boolean
  created_at: string
}

function formatDate(ts: string) {
  if (!ts) return "-"
  return new Date(ts).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

export function AdminUsersClient({ users, currentUserId }: { users: User[]; currentUserId: string }) {
  const [search, setSearch] = useState("")
  const [isPending, startTransition] = useTransition()
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const router = useRouter()

  const filtered = users.filter(u =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.id.toLowerCase().includes(search.toLowerCase())
  )

  function handleToggleAdmin(userId: string, current: boolean) {
    if (userId === currentUserId) return
    startTransition(async () => {
      await updateUserAdmin(userId, !current)
      router.refresh()
    })
  }

  function handleDelete(userId: string) {
    if (userId === currentUserId) return
    if (!confirm("Are you sure you want to delete this user?")) return
    startTransition(async () => {
      await deleteUser(userId)
      router.refresh()
    })
  }

  function copyId(id: string) {
    navigator.clipboard.writeText(id)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-sm text-white/55 mt-1">{users.length} registered accounts</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/55" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by email or ID..."
          className="pl-9 bg-white/[0.025]"
        />
      </div>

      {/* Users Table */}
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.025] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.05]">
                <th className="text-left px-4 py-3 text-xs font-medium text-white/55 uppercase tracking-wider">User</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-white/55 uppercase tracking-wider">ID</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-white/55 uppercase tracking-wider">Role</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-white/55 uppercase tracking-wider">Registered</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-white/55 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <AlertCircle className="h-8 w-8 text-white/40 mx-auto mb-3" />
                    <p className="text-sm text-white/55">{search ? "No users match your search" : "No users registered yet"}</p>
                  </td>
                </tr>
              ) : filtered.map((user) => (
                <tr key={user.id} className="hover:bg-white/[0.04] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-[#f97316]/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-[#f97316]">{user.email.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="font-medium text-white">{user.email}</p>
                        {user.id === currentUserId && (
                          <span className="text-[10px] text-[#f97316] font-medium">(You)</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => copyId(user.id)}
                      className="flex items-center gap-1.5 text-xs text-white/55 hover:text-white transition-colors font-mono"
                    >
                      {user.id.slice(0, 12)}...
                      {copiedId === user.id ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    {user.is_admin ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#f97316]/10 text-xs font-medium text-[#f97316]">
                        <Shield className="h-3 w-3" /> Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-white/[0.04] text-xs font-medium text-white/55">User</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-white/55 text-xs">{formatDate(user.created_at)}</td>
                  <td className="px-4 py-3 text-right">
                    {user.id !== currentUserId && (
                      <div className="flex items-center gap-1 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleAdmin(user.id, user.is_admin)}
                          disabled={isPending}
                          className="h-7 text-xs gap-1"
                        >
                          {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : user.is_admin ? <ShieldOff className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
                          {user.is_admin ? "Remove Admin" : "Make Admin"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(user.id)}
                          disabled={isPending}
                          className="h-7 text-xs text-red-400 hover:text-red-400 gap-1"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
