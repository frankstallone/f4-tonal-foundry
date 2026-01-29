'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'

import { cn } from '@/lib/utils'

function Sidebar({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r bg-sidebar pt-14 text-sidebar-foreground',
        className,
      )}
      {...props}
    />
  )
}

function SidebarHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('border-b px-4 py-4', className)} {...props} />
}

function SidebarContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const scrollRef = React.useRef<HTMLDivElement | null>(null)
  const [scrollState, setScrollState] = React.useState({
    top: false,
    bottom: false,
  })

  React.useEffect(() => {
    const el = scrollRef.current
    if (!el) return undefined
    let raf = 0

    const update = () => {
      const { scrollTop, scrollHeight, clientHeight } = el
      const canScroll = scrollHeight > clientHeight + 1
      const next = {
        top: canScroll && scrollTop > 1,
        bottom: canScroll && scrollTop + clientHeight < scrollHeight - 1,
      }
      setScrollState((prev) =>
        prev.top === next.top && prev.bottom === next.bottom ? prev : next,
      )
    }

    const onScroll = () => {
      if (raf) cancelAnimationFrame(raf)
      raf = requestAnimationFrame(update)
    }

    const resizeObserver = new ResizeObserver(onScroll)

    update()
    el.addEventListener('scroll', onScroll)
    resizeObserver.observe(el)

    return () => {
      el.removeEventListener('scroll', onScroll)
      resizeObserver.disconnect()
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div className="relative flex-1 min-h-0">
      <div
        ref={scrollRef}
        className={cn(
          'scrollbar-hidden h-full min-h-0 overflow-y-auto',
          className,
        )}
        {...props}
      />
      <div
        aria-hidden="true"
        className={cn(
          'sidebar-scroll-fade-top pointer-events-none absolute inset-x-0 top-0 h-6 opacity-0 transition-opacity',
          scrollState.top && 'opacity-100',
        )}
      />
      <div
        aria-hidden="true"
        className={cn(
          'sidebar-scroll-fade-bottom pointer-events-none absolute inset-x-0 bottom-0 h-6 opacity-0 transition-opacity',
          scrollState.bottom && 'opacity-100',
        )}
      />
    </div>
  )
}

function SidebarGroup({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('border-b border-border px-4 py-4', className)}
      {...props}
    />
  )
}

function SidebarGroupLabel({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn('text-xs font-medium text-muted-foreground', className)}
      {...props}
    />
  )
}

function SidebarGroupContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mt-4 space-y-4', className)} {...props} />
}

function SidebarMenu({
  className,
  ...props
}: React.HTMLAttributes<HTMLUListElement>) {
  return <ul className={cn('space-y-1', className)} {...props} />
}

function SidebarMenuItem({
  className,
  ...props
}: React.HTMLAttributes<HTMLLIElement>) {
  return <li className={cn('w-full', className)} {...props} />
}

type SidebarMenuButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean
  isActive?: boolean
}

function SidebarMenuButton({
  className,
  asChild,
  isActive,
  ...props
}: SidebarMenuButtonProps) {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      data-active={isActive ? 'true' : undefined}
      className={cn(
        'flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-1 focus-visible:ring-offset-sidebar',
        'data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground',
        className,
      )}
      {...props}
    />
  )
}

export {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
}
