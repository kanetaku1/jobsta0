'use client'

import { ReactNode } from 'react'
import { ToastProvider } from '@/components/ui/use-toast'
import { LiffProvider } from '@/lib/liff/liff-provider'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <LiffProvider>
        {children}
      </LiffProvider>
    </ToastProvider>
  )
}
