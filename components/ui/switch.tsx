'use client'

import * as React from 'react'
import { Switch as SwitchPrimitive } from '@base-ui/react/switch'

import { cn } from '@/lib/utils'

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    data-slot="switch"
    className={cn(
      'group inline-flex h-5 w-9 items-center rounded-full border border-border bg-muted shadow-xs transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[checked]:bg-primary data-[checked]:border-primary',
      className,
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb
      data-slot="switch-thumb"
      className="size-4 translate-x-0 rounded-full bg-background shadow-xs transition-transform group-data-[checked]:translate-x-4"
    />
  </SwitchPrimitive.Root>
))

Switch.displayName = 'Switch'

export { Switch }
