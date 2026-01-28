import { Suspense } from 'react'
import DashboardClient from './dashboard-client'

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-background" />}>
      <DashboardClient />
    </Suspense>
  )
}
