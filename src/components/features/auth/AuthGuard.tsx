'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  userType?: 'WORKER' | 'EMPLOYER';
  redirectTo?: string;
}

export default function AuthGuard({ 
  children, 
  requireAuth = true, 
  userType, 
  redirectTo = '/auth/login' 
}: AuthGuardProps) {
  const { user, prismaUser, userStatus, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (requireAuth) {
      if (!user || !prismaUser) {
        router.push(redirectTo);
        return;
      }

      if (userType && prismaUser.userType !== userType) {
        // ユーザータイプが一致しない場合は適切なページにリダイレクト
        const targetPage = prismaUser.userType === 'EMPLOYER' ? '/employer' : '/worker';
        router.push(targetPage);
        return;
      }
    }
  }, [user, prismaUser, userStatus, isLoading, requireAuth, userType, redirectTo, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (requireAuth && (!user || !prismaUser)) {
    return null; // リダイレクト中
  }

  if (userType && prismaUser?.userType !== userType) {
    return null; // リダイレクト中
  }

  return <>{children}</>;
}
