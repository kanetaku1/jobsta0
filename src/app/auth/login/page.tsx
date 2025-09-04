'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import useUser from '@/hooks/useUser';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const { toast } = useToast();
  const { signIn, isLoading, error, user } = useUser();

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast({
        title: 'エラー',
        description: 'メールアドレスとパスワードを入力してください',
        variant: 'destructive',
      });
      return;
    }

    try {
      await signIn({
        email: formData.email,
        password: formData.password,
      });

      toast({
        title: 'ログイン成功',
        description: 'ようこそ！',
      });

      // ユーザータイプに応じてリダイレクト
      if (user?.userType === 'EMPLOYER') {
        router.push('/employer');
      } else {
        router.push('/worker');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'エラー',
        description: error instanceof Error ? error.message : 'ログインに失敗しました。メールアドレスとパスワードを確認してください。',
        variant: 'destructive',
      });
    }
  };

  const handleGuestMode = () => {
    router.push('/auth/guest');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">ログイン</CardTitle>
          <CardDescription>
            アカウントにログインして、すべての機能を利用しましょう
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* メールアドレス */}
            <div>
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
                placeholder="example@email.com"
              />
            </div>

            {/* パスワード */}
            <div>
              <Label htmlFor="password">パスワード</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required
                placeholder="パスワードを入力"
              />
            </div>

            {/* ログインボタン */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'ログイン中...' : 'ログイン'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              アカウントをお持ちでないですか？{' '}
              <Link href="/auth/signup" className="text-blue-600 hover:underline">
                新規登録
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600 mb-4">
              または
            </p>
            <Button
              onClick={handleGuestMode}
              variant="outline"
              className="w-full"
            >
              GUESTモードで利用
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              GUESTモードでは、ログインなしでアプリの基本機能を利用できます
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
