'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import usePermissions from '@/hooks/usePermissions';
import Link from 'next/link';
import { Users, Search, QrCode, LogIn, UserPlus } from 'lucide-react';

export default function GuestHomePage() {
  const { userStatus } = useAuth();
  const { isGuest, isAuthenticated } = usePermissions();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Guestモード</h1>
        <p className="text-gray-600 text-lg">
          ログインなしで仕事情報を確認し、グループに参加できます
        </p>
      </div>

      {/* 現在の状態表示 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            現在の状態
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">
                {isAuthenticated ? 'ログイン済み' : 'Guestモード'}
              </p>
              <p className="text-sm text-gray-600">
                {isAuthenticated 
                  ? 'すべての機能を利用できます' 
                  : '制限付きで利用できます'
                }
              </p>
            </div>
            {!isAuthenticated && (
              <div className="flex space-x-2">
                <Button asChild variant="outline" size="sm">
                  <Link href="/auth/login">
                    <LogIn className="h-4 w-4 mr-1" />
                    ログイン
                  </Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/auth/signup">
                    <UserPlus className="h-4 w-4 mr-1" />
                    新規登録
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 利用可能な機能 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 仕事情報閲覧 */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              仕事情報を探す
            </CardTitle>
            <CardDescription>
              利用可能な求人情報を閲覧できます
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              時給、勤務日時、募集人数などの詳細情報を確認できます。
            </p>
            <Button asChild className="w-full">
              <Link href="/guest/jobs">
                求人一覧を見る
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* グループ参加 */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              グループに参加
            </CardTitle>
            <CardDescription>
              友達と一緒に応募するグループに参加できます
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              QRコードをスキャンするか、グループIDを入力して参加できます。
            </p>
            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link href="/guest/join">
                  <QrCode className="h-4 w-4 mr-2" />
                  QRコードで参加
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/guest/join">
                  グループIDで参加
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 制限事項 */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-yellow-800">Guestモードの制限</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-yellow-800">
            <p className="font-medium">以下の機能は利用できません:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>求人への応募</li>
              <li>グループの作成</li>
              <li>プロフィールの管理</li>
              <li>応募履歴の確認</li>
            </ul>
            <p className="text-sm mt-3">
              これらの機能を利用するには、ログインまたは新規登録が必要です。
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ログインのメリット */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800">ログインするとできること</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-blue-800">
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>求人への応募</li>
              <li>グループの作成と管理</li>
              <li>プロフィールの設定と管理</li>
              <li>応募履歴の確認</li>
              <li>通知の受信</li>
              <li>お気に入り求人の保存</li>
            </ul>
            <div className="flex space-x-2 mt-4">
              <Button asChild size="sm">
                <Link href="/auth/login">
                  <LogIn className="h-4 w-4 mr-1" />
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
        </CardContent>
      </Card>
    </div>
  );
}
