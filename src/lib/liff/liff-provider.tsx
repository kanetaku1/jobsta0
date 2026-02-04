'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import liff from '@line/liff'

interface LiffContextValue {
  isInitialized: boolean
  isLoggedIn: boolean
  isInClient: boolean
  userRole: 'JOB_SEEKER' | 'EMPLOYER' | null
  login: () => Promise<void>
  logout: () => Promise<void>
  shareInvite: (inviteUrl: string) => Promise<void>
}

const LiffContext = createContext<LiffContextValue | null>(null)

// 現在のLIFF IDからロールを判定
function getRoleFromLiffId(liffId: string): 'JOB_SEEKER' | 'EMPLOYER' {
  const employerLiffId = process.env.NEXT_PUBLIC_LIFF_ID_EMPLOYER
  if (employerLiffId && liffId === employerLiffId) {
    return 'EMPLOYER'
  }
  return 'JOB_SEEKER'
}

export function LiffProvider({ children }: { children: ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isInClient, setIsInClient] = useState(false)
  const [userRole, setUserRole] = useState<'JOB_SEEKER' | 'EMPLOYER' | null>(null)
  
  useEffect(() => {
    const initLiff = async () => {
      // URLパスから推測（/employerで始まる場合は雇用主用）
      const isEmployerPath = typeof window !== 'undefined' && window.location.pathname.startsWith('/employer')
      
      // ロールに応じてLIFF IDを選択
      let liffId: string | undefined
      let role: 'JOB_SEEKER' | 'EMPLOYER' = 'JOB_SEEKER'
      
      if (isEmployerPath) {
        liffId = process.env.NEXT_PUBLIC_LIFF_ID_EMPLOYER
        role = 'EMPLOYER'
      } else {
        liffId = process.env.NEXT_PUBLIC_LIFF_ID_JOB_SEEKER || process.env.NEXT_PUBLIC_LIFF_ID
        role = 'JOB_SEEKER'
      }
      
      if (!liffId) {
        console.log('LIFF ID not configured')
        return
      }
      
      try {
        await liff.init({ liffId })
        setIsInitialized(true)
        setIsInClient(liff.isInClient())
        setIsLoggedIn(liff.isLoggedIn())
        setUserRole(role)
        
        if (liff.isLoggedIn()) {
          // アクセストークンを取得してバックエンドで検証
          const accessToken = liff.getAccessToken()
          await verifyLiffToken(accessToken, role)
        }
      } catch (error) {
        console.error('LIFF initialization failed:', error)
      }
    }
    
    initLiff()
  }, [])
  
  const login = async () => {
    if (!isInitialized) {
      console.error('LIFF not initialized')
      return
    }
    
    if (!liff.isLoggedIn()) {
      liff.login()
    } else {
      const accessToken = liff.getAccessToken()
      await verifyLiffToken(accessToken, userRole || 'JOB_SEEKER')
      setIsLoggedIn(true)
    }
  }
  
  const logout = async () => {
    if (!isInitialized) return
    liff.logout()
    setIsLoggedIn(false)
  }
  
  const shareInvite = async (inviteUrl: string) => {
    if (!isInitialized || !liff.isInClient()) {
      throw new Error('LIFF not initialized or not in LINE client')
    }
    
    if (!liff.isApiAvailable('shareTargetPicker')) {
      throw new Error('shareTargetPicker not available')
    }
    
    try {
      await liff.shareTargetPicker([
        {
          type: 'text',
          text: `Jobstaに招待します！\n${inviteUrl}`,
        },
      ])
    } catch (error) {
      console.error('Share failed:', error)
      throw error
    }
  }
  
  return (
    <LiffContext.Provider
      value={{
        isInitialized,
        isLoggedIn,
        isInClient,
        userRole,
        login,
        logout,
        shareInvite,
      }}
    >
      {children}
    </LiffContext.Provider>
  )
}

export function useLiff() {
  const context = useContext(LiffContext)
  if (!context) {
    throw new Error('useLiff must be used within LiffProvider')
  }
  return context
}

async function verifyLiffToken(accessToken: string | null, role: 'JOB_SEEKER' | 'EMPLOYER') {
  if (!accessToken) return
  
  try {
    const response = await fetch('/api/auth/liff/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken, role }),
    })
    
    if (!response.ok) {
      throw new Error('LIFF token verification failed')
    }
  } catch (error) {
    console.error('LIFF token verification error:', error)
    throw error
  }
}
