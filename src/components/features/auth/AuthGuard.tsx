'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  userType?: 'WORKER' | 'EMPLOYER';
  redirectTo?: string;
  fallback?: ReactNode;
  showLoading?: boolean;
}

/**
 * 統一された認証ガードコンポーネント
 * Client ComponentとServer Componentの両方で使用可能
 */
export default function AuthGuard({ 
  children, 
  requireAuth = true, 
  userType, 
  redirectTo = '/auth/login',
  fallback,
  showLoading = true
}: AuthGuardProps) {
  const { 
    isAuthenticated, 
    isWorker, 
    isEmployer, 
    isLoading, 
    requireAuth: checkAuth,
    error 
  } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (requireAuth) {
      if (!checkAuth(userType)) {
        if (userType) {
          // ユーザータイプが指定されている場合、適切なページにリダイレクト
          const targetPage = isWorker ? '/worker' : isEmployer ? '/employer' : redirectTo;
          router.push(targetPage);
        } else {
          router.push(redirectTo);
        }
        return;
      }
    }
  }, [isAuthenticated, isWorker, isEmployer, isLoading, requireAuth, userType, redirectTo, router, checkAuth]);

  // ローディング状態
  if (isLoading && showLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  // エラー状態
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">エラーが発生しました</p>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  // 認証が必要で認証されていない場合
  if (requireAuth && !checkAuth(userType)) {
    return fallback || null; // リダイレクト中
  }

  return <>{children}</>;
}
