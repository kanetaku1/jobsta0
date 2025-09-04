'use client';

import { AuthGuard, AuthStatus, UserProfile } from '@/components/features/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import useUser from '@/hooks/useUser';
import Link from 'next/link';
import { useState } from 'react';

export default function TestAuthPage() {
  const { user, prismaUser, userStatus, isLoading, error } = useAuth();
  const { signIn, signUp, signOut } = useUser();
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [testPassword, setTestPassword] = useState('password123');

  const handleTestSignIn = async () => {
    try {
      await signIn({ email: testEmail, password: testPassword });
    } catch (error) {
      console.error('Test sign in error:', error);
    }
  };

  const handleTestSignUp = async () => {
    try {
      await signUp({ 
        email: testEmail, 
        password: testPassword, 
        name: 'テストユーザー',
        userType: 'WORKER'
      });
    } catch (error) {
      console.error('Test sign up error:', error);
    }
  };

  const handleTestSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Test sign out error:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">認証システムテストページ</h1>
      
      {/* 認証状態表示 */}
      <Card>
        <CardHeader>
          <CardTitle>認証状態</CardTitle>
          <CardDescription>現在の認証状態を確認できます</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <strong>ローディング状態:</strong> {isLoading ? '読み込み中' : '完了'}
          </div>
          <div>
            <strong>ユーザー状態:</strong> {userStatus}
          </div>
          <div>
            <strong>エラー:</strong> {error || 'なし'}
          </div>
          <div>
            <strong>Supabaseユーザー:</strong> {user ? 'ログイン済み' : '未ログイン'}
          </div>
          <div>
            <strong>Prismaユーザー:</strong> {prismaUser ? '同期済み' : '未同期'}
          </div>
        </CardContent>
      </Card>

      {/* テスト用の認証操作 */}
      <Card>
        <CardHeader>
          <CardTitle>テスト用認証操作</CardTitle>
          <CardDescription>認証機能をテストできます</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">テスト用メールアドレス</label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="test@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">テスト用パスワード</label>
              <input
                type="password"
                value={testPassword}
                onChange={(e) => setTestPassword(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="password123"
              />
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button onClick={handleTestSignUp} variant="outline">
              テスト用サインアップ
            </Button>
            <Button onClick={handleTestSignIn}>
              テスト用サインイン
            </Button>
            <Button onClick={handleTestSignOut} variant="destructive">
              サインアウト
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 認証状態コンポーネント */}
      <AuthStatus />

      {/* ユーザープロフィール（認証済みの場合のみ） */}
      {prismaUser && (
        <UserProfile />
      )}

      {/* 認証ガードのテスト */}
      <Card>
        <CardHeader>
          <CardTitle>認証ガードテスト</CardTitle>
          <CardDescription>認証が必要なコンテンツのテスト</CardDescription>
        </CardHeader>
        <CardContent>
          <AuthGuard requireAuth={true}>
            <div className="p-4 bg-green-100 border border-green-300 rounded">
              <p className="text-green-800">✅ 認証ガードを通過しました！このコンテンツは認証が必要です。</p>
            </div>
          </AuthGuard>
        </CardContent>
      </Card>

      {/* ナビゲーション */}
      <Card>
        <CardHeader>
          <CardTitle>ナビゲーション</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Button asChild variant="outline">
              <Link href="/">ホーム</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/auth/login">ログインページ</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/auth/signup">サインアップページ</Link>
            </Button>
            {prismaUser?.userType === 'WORKER' && (
              <Button asChild variant="outline">
                <Link href="/worker">ワーカーダッシュボード</Link>
              </Button>
            )}
            {prismaUser?.userType === 'EMPLOYER' && (
              <Button asChild variant="outline">
                <Link href="/employer">エンプロイヤーダッシュボード</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
