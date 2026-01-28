import { Fragment, type ReactNode } from 'react'
import Link from 'next/link'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

type Breadcrumb = {
  label: string
  href?: string
}

type AppShellProps = {
  title: string
  breadcrumbs?: Breadcrumb[]
  actions?: ReactNode
  sidebar: ReactNode
  children: ReactNode
}

export function AppShell({
  title,
  breadcrumbs,
  actions,
  sidebar,
  children,
}: AppShellProps) {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="fixed inset-x-0 top-0 z-40 border-b bg-sidebar">
        <div className="flex h-14 items-center justify-between gap-4 px-6">
          <div className="space-y-1">
            {breadcrumbs?.length ? (
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbs.map((crumb, index) => {
                    const isLast = index === breadcrumbs.length - 1
                    return (
                      <Fragment key={`${crumb.label}-${index}`}>
                        <BreadcrumbItem>
                          {crumb.href && !isLast ? (
                            <BreadcrumbLink asChild>
                              <Link href={crumb.href}>{crumb.label}</Link>
                            </BreadcrumbLink>
                          ) : (
                            <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                          )}
                        </BreadcrumbItem>
                        {!isLast ? <BreadcrumbSeparator /> : null}
                      </Fragment>
                    )
                  })}
                </BreadcrumbList>
              </Breadcrumb>
            ) : null}
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
