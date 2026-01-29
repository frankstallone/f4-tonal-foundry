import type { ReactNode } from 'react'

type AppShellProps = {
  title: string
  actions?: ReactNode
  sidebar: ReactNode
  children: ReactNode
}

export function AppShell({ title, actions, sidebar, children }: AppShellProps) {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="fixed inset-x-0 top-0 z-40 border-b bg-sidebar">
        <div className="flex h-14 items-center justify-between gap-4 px-6">
          <div className="space-y-1">
            <h1 className="text-balance text-lg font-semibold">{title}</h1>
          </div>
          {actions ? (
            <div className="flex flex-wrap items-center gap-2">{actions}</div>
          ) : null}
        </div>
      </header>
      {sidebar}
      <main className="min-h-dvh bg-muted pl-64 pt-14">{children}</main>
    </div>
  )
}
