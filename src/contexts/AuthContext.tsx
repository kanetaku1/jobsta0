'use client';

import { supabase } from '@/lib/supabase';
import { getUserOrSync } from '@/lib/actions/auth';
import { User } from '@supabase/supabase-js';
import { User as PrismaUser } from '@prisma/client';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

export type UserStatus = 'GUEST' | 'REGISTERED' | 'LOADING';

interface SignInData {
  email: string;
  password: string;
}

interface SignUpData {
  email: string;
  password: string;
  name: string;
  userType: 'WORKER' | 'EMPLOYER';
}

interface AuthContextType {
  user: User | null;
  userStatus: UserStatus;
  guestInfo: {
    displayName: string;
    userId: string;
  } | null;
  prismaUser: PrismaUser | null;
  signOut: () => Promise<void>;
  setGuestMode: (displayName: string) => void;
  clearGuestMode: () => void;
  isLoading: boolean;
  error: string | null;
  // 認証チェック用のヘルパー関数
  isAuthenticated: boolean;
  isWorker: boolean;
  isEmployer: boolean;
  isGuest: boolean;
  // 認証が必要な場合のチェック関数
  requireAuth: (userType?: 'WORKER' | 'EMPLOYER') => boolean;
  // 認証アクション
  signIn: (data: SignInData) => Promise<User | undefined>;
  signUp: (data: SignUpData) => Promise<User | undefined>;
  // 便利なヘルパー関数
  canAccess: (userType?: 'WORKER' | 'EMPLOYER') => boolean;
  isOwner: (userId: number) => boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userStatus, setUserStatus] = useState<UserStatus>('LOADING');
  const [prismaUser, setPrismaUser] = useState<PrismaUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guestInfo, setGuestInfo] = useState<{
    displayName: string;
    userId: string;
  } | null>(null);

  useEffect(() => {
    // 初期化時にローカルストレージとSupabaseの状態を確認
    const initializeAuth = () => {
      // ローカルストレージからGUEST情報を確認
      const guestMode = localStorage.getItem('guestMode');
      const guestDisplayName = localStorage.getItem('guestDisplayName');
      const guestUserId = localStorage.getItem('guestUserId');

      if (guestMode === 'true' && guestDisplayName && guestUserId) {
        setGuestInfo({
          displayName: guestDisplayName,
          userId: guestUserId,
        });
        setUserStatus('GUEST');
        return;
      }

      // Supabaseのセッションを確認
      const checkSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          setUserStatus('REGISTERED');
          
          // Prismaユーザー情報を取得または同期
          try {
            const prismaUserData = await getUserOrSync(session.user.id, {
              email: session.user.email || '',
              name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
              userType: 'WORKER'
            });
            setPrismaUser(prismaUserData);
            setError(null);
          } catch (error) {
            console.error('Failed to get or sync user:', error);
            setError('ユーザー情報の取得・同期に失敗しました');
          } finally {
            setIsLoading(false);
          }
        } else {
          setUserStatus('LOADING');
          setPrismaUser(null);
          setIsLoading(false);
        }
      };

      checkSession();
    };

    initializeAuth();

    // Supabaseの認証状態変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          setUserStatus('REGISTERED');
          
          // Prismaユーザー情報を取得または同期
          try {
            const prismaUserData = await getUserOrSync(session.user.id, {
              email: session.user.email || '',
              name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
              userType: 'WORKER'
            });
            setPrismaUser(prismaUserData);
            setError(null);
          } catch (error) {
            console.error('Failed to get or sync user:', error);
            setError('ユーザー情報の取得・同期に失敗しました');
          } finally {
            setIsLoading(false);
          }
          
          // GUESTモードをクリア
          clearGuestMode();
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setPrismaUser(null);
          setUserStatus('LOADING');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setPrismaUser(null);
      setUserStatus('LOADING');
      clearGuestMode();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const setGuestMode = (displayName: string) => {
    const guestUserId = `guest_${Date.now()}`;
    localStorage.setItem('guestMode', 'true');
    localStorage.setItem('guestDisplayName', displayName);
    localStorage.setItem('guestUserId', guestUserId);
    
    setGuestInfo({
      displayName,
      userId: guestUserId,
    });
    setUserStatus('GUEST');
  };

  const clearGuestMode = () => {
    localStorage.removeItem('guestMode');
    localStorage.removeItem('guestDisplayName');
    localStorage.removeItem('guestUserId');
    setGuestInfo(null);
  };

  // サインイン関数
  const signIn = async ({ email, password }: SignInData) => {
    try {
      setIsAuthLoading(true);
      
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) {
        throw new Error(signInError.message);
      }

      if (data.user) {
        // ユーザー情報の同期は認証状態変更リスナーで処理される
        return data.user;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'サインインに失敗しました';
      throw new Error(errorMessage);
    } finally {
      setIsAuthLoading(false);
    }
  };

  // サインアップ関数
  const signUp = async ({ email, password, name, userType }: SignUpData) => {
    try {
      setIsAuthLoading(true);
      
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || email.split('@')[0],
            user_type: userType || 'WORKER'
          }
        }
      });

      if (signUpError) {
        throw new Error(signUpError.message);
      }

      if (data.user) {
        // ユーザー情報の同期は認証状態変更リスナーで処理される
        return data.user;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'サインアップに失敗しました';
      throw new Error(errorMessage);
    } finally {
      setIsAuthLoading(false);
    }
  };

  // 認証状態のヘルパー関数
  const isAuthenticated = userStatus === 'REGISTERED' && !!user && !!prismaUser;
  const isWorker = isAuthenticated && prismaUser?.userType === 'WORKER';
  const isEmployer = isAuthenticated && prismaUser?.userType === 'EMPLOYER';
  const isGuest = userStatus === 'GUEST';

  // 認証が必要な場合のチェック関数
  const requireAuth = (userType?: 'WORKER' | 'EMPLOYER'): boolean => {
    if (!isAuthenticated) return false;
    if (userType && prismaUser?.userType !== userType) return false;
    return true;
  };

  // 便利なヘルパー関数
  const canAccess = (userType?: 'WORKER' | 'EMPLOYER'): boolean => {
    if (!isAuthenticated) return false;
    if (userType && prismaUser?.userType !== userType) return false;
    return true;
  };

  const isOwner = (userId: number): boolean => {
    return prismaUser?.id === userId;
  };

  const hasPermission = (permission: string): boolean => {
    // 将来的に権限システムを実装する場合の拡張ポイント
    if (!isAuthenticated) return false;
    
    // 基本的な権限チェック
    switch (permission) {
      case 'create_job':
        return isEmployer;
      case 'apply_job':
        return isWorker || isGuest;
      case 'manage_group':
        return isWorker;
      default:
        return false;
    }
  };

  const value: AuthContextType = {
    user,
    userStatus,
    guestInfo,
    prismaUser,
    signOut,
    setGuestMode,
    clearGuestMode,
    isLoading: isLoading || isAuthLoading,
    error,
    isAuthenticated,
    isWorker,
    isEmployer,
    isGuest,
    requireAuth,
    signIn,
    signUp,
    canAccess,
    isOwner,
    hasPermission,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
