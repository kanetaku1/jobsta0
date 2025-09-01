'use client';

import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

export type UserStatus = 'GUEST' | 'REGISTERED' | 'LOADING';

interface AuthContextType {
  user: User | null;
  userStatus: UserStatus;
  guestInfo: {
    displayName: string;
    userId: string;
  } | null;
  signOut: () => Promise<void>;
  setGuestMode: (displayName: string) => void;
  clearGuestMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userStatus, setUserStatus] = useState<UserStatus>('LOADING');
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
        } else {
          setUserStatus('LOADING');
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
          // GUESTモードをクリア
          clearGuestMode();
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
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
    signOut,
    setGuestMode,
    clearGuestMode,
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
