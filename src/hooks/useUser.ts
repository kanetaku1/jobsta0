"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { Session, User as SupabaseUser } from "@supabase/supabase-js";
import { User, UseUserReturn, AuthError, SignUpData, SignInData } from "@/types/user";
import { getUserBySupabaseId } from "@/lib/actions/auth";
import { User as PrismaUser } from "@prisma/client";

export default function useUser(): UseUserReturn {
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [prismaUser, setPrismaUser] = useState<PrismaUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // SupabaseユーザーからPrismaユーザーへの変換
  const user: User | null = prismaUser ? {
    id: prismaUser.id,
    email: prismaUser.email,
    name: prismaUser.name,
    avatar: prismaUser.avatar,
    phone: prismaUser.phone,
    address: prismaUser.address,
    emergencyContact: prismaUser.emergencyContact,
    companyName: prismaUser.companyName,
    companyAddress: prismaUser.companyAddress,
    companyPhone: prismaUser.companyPhone,
    userType: prismaUser.userType,
    supabaseUserId: prismaUser.supabaseUserId,
    createdAt: prismaUser.createdAt,
  } : null;

  // ユーザー情報を取得する関数
  const fetchUserData = async (supabaseUserId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      let user;
      try {
        user = await getUserBySupabaseId(supabaseUserId);
      } catch (err) {
        // ユーザーが見つからない場合は同期を試行
        const { syncUserToDatabase } = await import('@/lib/actions/auth');
        
        // Supabaseユーザー情報を取得
        const { data: { user: supabaseUser } } = await supabase.auth.getUser();
        if (!supabaseUser) {
          throw new Error('Supabaseユーザー情報が取得できません');
        }

        user = await syncUserToDatabase(supabaseUserId, {
          email: supabaseUser.email || '',
          name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0],
          userType: supabaseUser.user_metadata?.user_type || 'WORKER'
        });
      }
      
      setPrismaUser(user);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'ユーザー情報の取得に失敗しました';
      setError(errorMessage);
      console.error('Failed to fetch user data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 認証状態の監視
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSupabaseUser(session?.user || null);
        
        if (session?.user) {
          await fetchUserData(session.user.id);
        } else {
          setPrismaUser(null);
          setIsLoading(false);
          setError(null);
        }
      }
    );

    // 初期セッションの確認
    const checkInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSupabaseUser(session?.user || null);
        
        if (session?.user) {
          await fetchUserData(session.user.id);
        } else {
          setIsLoading(false);
        }
      } catch (err) {
        setError('セッションの確認に失敗しました');
        setIsLoading(false);
      }
    };

    checkInitialSession();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // サインアップ関数
  const signUp = async ({ email, password, name, userType }: SignUpData) => {
    try {
      setIsLoading(true);
      setError(null);

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
        setSupabaseUser(data.user);
        // ユーザー情報の同期は認証状態変更リスナーで処理される
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'サインアップに失敗しました';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // サインイン関数
  const signIn = async ({ email, password }: SignInData) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) {
        throw new Error(signInError.message);
      }

      if (data.user) {
        setSupabaseUser(data.user);
        // ユーザー情報の同期は認証状態変更リスナーで処理される
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'サインインに失敗しました';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // サインアウト関数
  const signOut = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        throw new Error(signOutError.message);
      }

      setSupabaseUser(null);
      setPrismaUser(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'サインアウトに失敗しました';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // ユーザー情報の再取得
  const refreshUser = async () => {
    if (supabaseUser?.id) {
      await fetchUserData(supabaseUser.id);
    }
  };

  return {
    user,
    supabaseUser,
    prismaUser,
    isLoading,
    error,
    signUp,
    signIn,
    signOut,
    refreshUser
  };
}
