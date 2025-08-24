'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { Button } from '../buttons/Button';

export function Header() {
  const { userStatus, user, guestInfo, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  const renderAuthSection = () => {
    switch (userStatus) {
      case 'LOADING':
        return (
          <div className="flex items-center space-x-4">
            <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
          </div>
        );
      
      case 'GUEST':
        return (
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {guestInfo?.displayName}さん (GUEST)
            </span>
            <Link href="/auth/signup">
              <Button variant="outline" size="sm">
                アカウント作成
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                localStorage.removeItem('guestMode');
                localStorage.removeItem('guestDisplayName');
                localStorage.removeItem('guestUserId');
                window.location.reload();
              }}
            >
              GUEST終了
            </Button>
          </div>
        );
      
      case 'REGISTERED':
        return (
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {user?.email}
            </span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              ログアウト
            </Button>
          </div>
        );
      
      default:
        return (
          <div className="flex items-center space-x-4">
            <Link href="/auth/login">
              <Button variant="outline" size="sm">
                ログイン
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm">
                新規登録
              </Button>
            </Link>
          </div>
        );
    }
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-4xl mx-auto p-4 flex justify-between items-center">
        <Link href="/" className="text-lg font-bold text-blue-600">
          Jobsta
        </Link>
        <nav className="flex items-center space-x-4">
          {userStatus !== 'LOADING' && (
            <>
              <Link href="/worker" className="hover:underline text-sm">
                求人を探す
              </Link>
              <Link href="/employer" className="hover:underline text-sm">
                求人を登録
              </Link>
              <Link href="/groups" className="hover:underline text-sm">
                グループ
              </Link>
            </>
          )}
          {renderAuthSection()}
        </nav>
      </div>
    </header>
  );
}
