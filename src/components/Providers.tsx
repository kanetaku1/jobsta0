'use client'

import { ReactNode, useEffect } from 'react'
import { ToastProvider } from '@/components/ui/use-toast'
import { initializeDemoData } from '@/lib/demoData'

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    // デモデータを初期化
    initializeDemoData()
  }, [])

  return (
    <ToastProvider>
      {children}
    </ToastProvider>
  )
}

