import { KeeperDashboard } from "@/components/keeper-dashboard"

export const metadata = {
  title: "Keeper Dashboard",
}

export default function KeeperPage() {
  return (
    <main className="min-h-screen bg-background">
      <KeeperDashboard />
    </main>
  )
}
