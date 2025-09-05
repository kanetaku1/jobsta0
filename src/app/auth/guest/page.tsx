'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface GuestFormData {
  displayName: string;
}

export default function GuestModePage() {
  const router = useRouter();
  const [formData, setFormData] = useState<GuestFormData>({
    displayName: '',
  });
  const { toast } = useToast()

  const handleInputChange = (field: keyof GuestFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGuestStart = () => {
    if (!formData.displayName.trim()) {
      toast({
        title: 'エラー',
        description: '表示名を入力してください',
        variant: 'destructive',
      });
      return;
    }

    // ローカルストレージにGUEST情報を保存
    localStorage.setItem('guestMode', 'true');
    localStorage.setItem('guestDisplayName', formData.displayName);
    localStorage.setItem('guestUserId', `guest_${Date.now()}`);

    toast({
      title: 'GUESTモード開始',
      description: `${formData.displayName}さんとしてアプリを利用できます`,
    });

    // ホームページにリダイレクト
    router.push('/guest');
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">GUESTモード</CardTitle>
          <CardDescription>
            ログインなしでアプリの基本機能を利用できます
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* 説明 */}
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                GUESTモードでは、以下の機能を利用できます：
              </p>
              <ul className="text-sm text-gray-600 space-y-2 text-left">
                <li>• 求人情報の閲覧</li>
                <li>• 応募待機ルームの参加</li>
                <li>• グループでの交流</li>
                <li>• 基本的なアプリ機能</li>
              </ul>
            </div>

            {/* 制限事項 */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 mb-2">⚠️ 制限事項</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• 本応募には個人情報の登録が必要</li>
                <li>• 一部の高度な機能は利用不可</li>
                <li>• データはローカルに保存（永続化されません）</li>
              </ul>
            </div>

            {/* 表示名入力 */}
            <div>
              <Label htmlFor="displayName">表示名 *</Label>
              <Input
                id="displayName"
                type="text"
                value={formData.displayName}
                onChange={(e) => handleInputChange('displayName', e.target.value)}
                required
                placeholder="例: 田中太郎"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                この名前でアプリ内に表示されます
              </p>
            </div>

            {/* 開始ボタン */}
            <Button
              onClick={handleGuestStart}
              className="w-full"
              disabled={!formData.displayName.trim()}
            >
              GUESTモードで開始
            </Button>

            {/* アカウント作成への誘導 */}
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                より多くの機能を利用したい場合は
              </p>
              <Link href="/auth/signup" className="text-blue-600 hover:underline">
                アカウントを作成
              </Link>
            </div>

            {/* ログインへの誘導 */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                すでにアカウントをお持ちですか？{' '}
                <Link href="/auth/login" className="text-blue-600 hover:underline">
                  ログイン
                </Link>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
