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

// セッションストレージのキー
const VERIFICATION_CACHE_KEY = 'liff_token_verified'
const VERIFICATION_TIMESTAMP_KEY = 'liff_token_verified_at'
const VERIFICATION_CACHE_DURATION = 5 * 60 * 1000 // 5分間キャッシュ

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
          // トークン検証のキャッシュをチェック
          const shouldVerify = shouldVerifyToken()
          
          if (shouldVerify) {
            // アクセストークンを取得してバックエンドで検証
            const accessToken = liff.getAccessToken()
            await verifyLiffToken(accessToken, role)
            
            // 検証成功時にキャッシュを保存
            if (typeof window !== 'undefined') {
              sessionStorage.setItem(VERIFICATION_CACHE_KEY, 'true')
              sessionStorage.setItem(VERIFICATION_TIMESTAMP_KEY, Date.now().toString())
            }
          } else {
            console.log('Token verification skipped (cached)')
          }
        }
      } catch (error) {
        console.error('LIFF initialization failed:', error)
        // エラー時はキャッシュをクリア
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem(VERIFICATION_CACHE_KEY)
          sessionStorage.removeItem(VERIFICATION_TIMESTAMP_KEY)
        }
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
      // トークン検証のキャッシュをチェック
      const shouldVerify = shouldVerifyToken()
      
      if (shouldVerify) {
        const accessToken = liff.getAccessToken()
        await verifyLiffToken(accessToken, userRole || 'JOB_SEEKER')
        
        // 検証成功時にキャッシュを保存
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(VERIFICATION_CACHE_KEY, 'true')
          sessionStorage.setItem(VERIFICATION_TIMESTAMP_KEY, Date.now().toString())
        }
      }
      
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

// トークン検証が必要かどうかを判定
function shouldVerifyToken(): boolean {
  if (typeof window === 'undefined') return true
  
  const verified = sessionStorage.getItem(VERIFICATION_CACHE_KEY)
  const timestamp = sessionStorage.getItem(VERIFICATION_TIMESTAMP_KEY)
  
  // キャッシュがない場合は検証が必要
  if (!verified || !timestamp) return true
  
  // キャッシュの有効期限をチェック
  const now = Date.now()
  const verifiedAt = parseInt(timestamp, 10)
  const elapsed = now - verifiedAt
  
  // 有効期限切れの場合は検証が必要
  if (elapsed > VERIFICATION_CACHE_DURATION) {
    sessionStorage.removeItem(VERIFICATION_CACHE_KEY)
    sessionStorage.removeItem(VERIFICATION_TIMESTAMP_KEY)
    return true
  }
  
  // キャッシュが有効な場合は検証をスキップ
  return false
}

async function verifyLiffToken(accessToken: string | null, role: 'JOB_SEEKER' | 'EMPLOYER') {
  if (!accessToken) return
  
  try {
    console.log('Verifying LIFF token...')
    const response = await fetch('/api/auth/liff/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken, role }),
    })
    
    if (!response.ok) {
      throw new Error('LIFF token verification failed')
    }
    console.log('LIFF token verified successfully')
  } catch (error) {
    console.error('LIFF token verification error:', error)
    throw error
  }
}
