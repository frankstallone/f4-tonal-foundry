'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'

import { Switch } from '@/components/ui/switch'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="h-5 w-9 rounded-full border border-border" />
  }

  const checked = theme === 'dark'

  return (
    <Switch
      aria-label="Toggle dark mode"
      checked={checked}
      onCheckedChange={(value) => setTheme(value ? 'dark' : 'light')}
    />
  )
}
