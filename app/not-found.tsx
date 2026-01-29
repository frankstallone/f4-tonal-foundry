import Link from 'next/link'
import { SearchX } from 'lucide-react'

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'

export default function NotFound() {
  return (
    <div className="min-h-dvh bg-background px-6 py-12">
      <Empty className="mx-auto max-w-2xl border-border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SearchX className="size-5" />
          </EmptyMedia>
          <EmptyTitle>Page not found</EmptyTitle>
          <EmptyDescription>
            The page you&apos;re looking for doesn&apos;t exist or has moved.
            Check the URL or head back to the dashboard.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className="flex flex-wrap justify-center gap-2">
            <Link
              href="/dashboard"
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
            >
              Go to dashboard
            </Link>
            <Link
              href="/"
              className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Back to home
            </Link>
          </div>
        </EmptyContent>
      </Empty>
    </div>
  )
}
