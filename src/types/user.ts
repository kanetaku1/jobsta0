// ユーザー関連の型定義

import { User as SupabaseUser } from '@supabase/supabase-js'
import { User as PrismaUser, UserType } from '@prisma/client'

// 認証状態の型
export type AuthStatus = 'LOADING' | 'AUTHENTICATED' | 'UNAUTHENTICATED' | 'ERROR'

// ユーザー情報の統合型
export interface User {
  id: number
  email: string
  name: string | null
  avatar: string | null
  phone: string | null
  address: string | null
  emergencyContact: string | null
  companyName: string | null
  companyAddress: string | null
  companyPhone: string | null
  userType: UserType
  supabaseUserId: string | null
  createdAt: Date
}

// 認証フックの戻り値の型
export interface UseUserReturn {
  user: User | null
  supabaseUser: SupabaseUser | null
  prismaUser: PrismaUser | null
  isLoading: boolean
  error: string | null
  signUp: (credentials: SignUpData) => Promise<void>
  signIn: (credentials: { email: string; password: string }) => Promise<void>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

// 認証エラーの型
export interface AuthError {
  message: string
  code?: string
}

// ユーザー登録用の型
export interface SignUpData {
  email: string
  password: string
  name?: string
  userType?: UserType
}

// ユーザーサインイン用の型
export interface SignInData {
  email: string
  password: string
}

// プロフィール更新用の型
export interface UpdateProfileData {
  name?: string
  phone?: string
  address?: string
  emergencyContact?: string
  companyName?: string
  companyAddress?: string
  companyPhone?: string
}
