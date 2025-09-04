'use client';

import { supabase } from '@/lib/supabase';
import { getUserOrSync } from '@/lib/actions/auth';
import { User } from '@supabase/supabase-js';
import { User as PrismaUser } from '@prisma/client';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

export type UserStatus = 'GUEST' | 'REGISTERED' | 'LOADING';

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userStatus, setUserStatus] = useState<UserStatus>('LOADING');
  const [prismaUser, setPrismaUser] = useState<PrismaUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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

  const value: AuthContextType = {
    user,
    userStatus,
    guestInfo,
    prismaUser,
    signOut,
    setGuestMode,
    clearGuestMode,
    isLoading,
    error,
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
