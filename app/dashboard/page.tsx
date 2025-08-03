"use client"

import { DashboardLayout } from "../../components/layout/dashboard-layout"
import { ClientDashboardContent } from "../../components/client/client-dashboard-content"

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <ClientDashboardContent />
    </DashboardLayout>
  )
}
