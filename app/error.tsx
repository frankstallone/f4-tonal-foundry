'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-dvh bg-background px-6 py-12">
      <Empty className="mx-auto max-w-2xl border-border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <AlertTriangle className="size-5" />
          </EmptyMedia>
          <EmptyTitle>Something went wrong</EmptyTitle>
          <EmptyDescription>
            An unexpected error occurred while loading this page. You can try
            again or return to the dashboard.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className="flex flex-wrap justify-center gap-2">
            <Button variant="outline" onClick={() => reset()}>
              Try again
            </Button>
            <Button onClick={() => (window.location.href = '/dashboard')}>
              Go to dashboard
            </Button>
          </div>
        </EmptyContent>
      </Empty>
    </div>
  )
}
