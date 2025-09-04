'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useState } from 'react';
import Link from 'next/link';
import { User, LogIn, UserPlus, AlertCircle } from 'lucide-react';

interface LoginPromptProps {
  title?: string;
  description?: string;
  action?: string;
  onLogin?: () => void;
  onSignup?: () => void;
  showGuestOption?: boolean;
}

export default function LoginPrompt({ 
  title = 'ログインが必要です',
  description = 'この機能を利用するにはログインが必要です',
  action = '応募',
  onLogin,
  onSignup,
  showGuestOption = true
}: LoginPromptProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    if (onLogin) {
      onLogin();
    } else {
      // デフォルトのログイン処理
      window.location.href = '/auth/login';
    }
  };

  const handleSignup = () => {
    if (onSignup) {
      onSignup();
    } else {
      // デフォルトのサインアップ処理
      window.location.href = '/auth/signup';
    }
  };

  const handleGuestContinue = () => {
    toast({
      title: 'Guestモードの制限',
      description: `${action}するにはログインが必要です。アカウントを作成して続行してください。`,
      variant: 'destructive',
    });
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="h-6 w-6 text-blue-600" />
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription className="text-base">
          {description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* ログイン・サインアップボタン */}
        <div className="space-y-3">
          <Button 
            onClick={handleLogin}
            className="w-full"
            disabled={isLoading}
          >
            <LogIn className="h-4 w-4 mr-2" />
            ログイン
          </Button>
          
          <Button 
            onClick={handleSignup}
            variant="outline"
            className="w-full"
            disabled={isLoading}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            新規登録
          </Button>
        </div>

        {/* ログインのメリット */}
        <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm">
          <h4 className="font-medium text-blue-900 mb-2">ログインするとできること:</h4>
          <ul className="text-blue-800 space-y-1">
            <li>• 求人への応募</li>
            <li>• グループの作成</li>
            <li>• プロフィールの管理</li>
            <li>• 応募履歴の確認</li>
            <li>• 通知の受信</li>
          </ul>
        </div>

        {/* Guestモードの制限 */}
        {showGuestOption && (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-4 text-sm">
            <h4 className="font-medium text-yellow-900 mb-2">Guestモードの制限:</h4>
            <ul className="text-yellow-800 space-y-1">
              <li>• 仕事情報の閲覧のみ</li>
              <li>• グループへの参加のみ</li>
              <li>• 応募はできません</li>
            </ul>
          </div>
        )}

        {/* クイックアクション */}
        <div className="pt-4 border-t">
          <div className="text-center text-sm text-gray-600 mb-3">
            または
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/auth/login">
                <User className="h-4 w-4 mr-1" />
                ログイン
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/auth/signup">
                <UserPlus className="h-4 w-4 mr-1" />
                新規登録
              </Link>
            </Button>
          </div>
        </div>

        {/* アカウント作成のメリット */}
        <div className="text-center text-xs text-gray-500">
          <p>
            アカウント作成は無料です。
            <br />
            個人情報は安全に保護されます。
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
