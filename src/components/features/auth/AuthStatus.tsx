'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AuthStatus() {
  const { user, prismaUser, userStatus, isLoading, error, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">読み込み中...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">エラー</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline" 
            className="mt-4"
          >
            再読み込み
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (userStatus === 'GUEST') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>GUESTモード</CardTitle>
          <CardDescription>
            ログインしてすべての機能を利用しましょう
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Button asChild>
              <Link href="/auth/login">ログイン</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/auth/signup">新規登録</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!user || !prismaUser) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>認証が必要です</CardTitle>
          <CardDescription>
            この機能を利用するにはログインが必要です
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Button asChild>
              <Link href="/auth/login">ログイン</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/auth/signup">新規登録</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>ユーザー情報</CardTitle>
        <CardDescription>
          ログイン中: {prismaUser.email}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div>
            <span className="font-medium">名前:</span> {prismaUser.name || '未設定'}
          </div>
          <div>
            <span className="font-medium">ユーザータイプ:</span> 
            <span className={`ml-2 px-2 py-1 rounded text-sm ${
              prismaUser.userType === 'EMPLOYER' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {prismaUser.userType === 'EMPLOYER' ? 'エンプロイヤー' : 'ワーカー'}
            </span>
          </div>
          {prismaUser.phone && (
            <div>
              <span className="font-medium">電話番号:</span> {prismaUser.phone}
            </div>
          )}
          {prismaUser.address && (
            <div>
              <span className="font-medium">住所:</span> {prismaUser.address}
            </div>
          )}
        </div>
        
        <div className="flex space-x-2">
          <Button asChild variant="outline">
            <Link href={prismaUser.userType === 'EMPLOYER' ? '/employer' : '/worker'}>
              ダッシュボード
            </Link>
          </Button>
          <Button onClick={handleSignOut} variant="destructive">
            ログアウト
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
