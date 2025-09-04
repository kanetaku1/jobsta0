'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import usePermissions from '@/hooks/usePermissions';
import { GuestJobCard, GuestGroupJoin } from '@/components/features/guest';
import { QRCodeGenerator, QRCodeScanner } from '@/components/features/qr';
import { LoginPrompt } from '@/components/features/auth';
import { Job } from '@/types/group';
import { Users, Search, QrCode, LogIn, UserPlus } from 'lucide-react';
import Link from 'next/link';

export default function TestGuestPage() {
  const { userStatus, setGuestMode } = useAuth();
  const { 
    canViewJobs, 
    canJoinGroups, 
    canCreateGroups, 
    canApplyJobs,
    isGuest, 
    isAuthenticated 
  } = usePermissions();
  
  const [showQRGenerator, setShowQRGenerator] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [displayName, setDisplayName] = useState('');

  // サンプルデータ
  const sampleJob: Job = {
    id: 1,
    title: 'イベント会場スタッフ',
    description: '音楽イベントの会場設営・撤収作業',
    wage: 1200,
    jobDate: new Date('2024-02-15T10:00:00'),
    maxMembers: 10,
    status: 'ACTIVE',
    creatorId: 1,
    location: '東京都渋谷区',
    requirements: '体力に自信がある方',
    createdAt: new Date()
  };

  const handleSetGuestMode = () => {
    const name = prompt('表示名を入力してください:');
    if (name) {
      setDisplayName(name);
      setGuestMode(name);
    }
  };

  const handleJoinGroup = (groupId: number, displayName: string) => {
    console.log('Join group:', groupId, 'with display name:', displayName);
  };

  const handleQRScanSuccess = (data: any) => {
    console.log('QR scan success:', data);
    setShowQRScanner(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Guest機能テストページ</h1>
      
      {/* 現在の状態表示 */}
      <Card>
        <CardHeader>
          <CardTitle>現在の状態</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <strong>認証状態:</strong> {userStatus}
            </div>
            <div>
              <strong>Guest:</strong> {isGuest ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>認証済み:</strong> {isAuthenticated ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>表示名:</strong> {displayName || '未設定'}
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <strong>仕事情報閲覧:</strong> {canViewJobs ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>グループ参加:</strong> {canJoinGroups ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>グループ作成:</strong> {canCreateGroups ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>求人応募:</strong> {canApplyJobs ? 'Yes' : 'No'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Guestモード設定 */}
      {!isAuthenticated && (
        <Card>
          <CardHeader>
            <CardTitle>Guestモード設定</CardTitle>
            <CardDescription>
              ログインなしでアプリを利用するための設定
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">表示名</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="表示名を入力"
                  className="w-full p-2 border rounded"
                />
              </div>
              <Button onClick={handleSetGuestMode}>
                Guestモードを開始
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 仕事情報カードテスト */}
      <Card>
        <CardHeader>
          <CardTitle>仕事情報カード（Guest用）</CardTitle>
          <CardDescription>
            Guestモードで表示される仕事情報カード
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GuestJobCard
            job={sampleJob}
            onJoinGroup={(jobId) => console.log('Join group for job:', jobId)}
            onViewDetails={(jobId) => console.log('View details for job:', jobId)}
          />
        </CardContent>
      </Card>

      {/* グループ参加テスト */}
      <Card>
        <CardHeader>
          <CardTitle>グループ参加（Guest用）</CardTitle>
          <CardDescription>
            Guestモードでのグループ参加機能
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GuestGroupJoin
            jobId={1}
            onJoinGroup={handleJoinGroup}
            onScanQR={() => setShowQRScanner(true)}
          />
        </CardContent>
      </Card>

      {/* QRコード機能テスト */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>QRコード生成</CardTitle>
            <CardDescription>
              グループ参加用のQRコードを生成
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setShowQRGenerator(true)}>
              <QrCode className="h-4 w-4 mr-2" />
              QRコードを生成
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>QRコードスキャン</CardTitle>
            <CardDescription>
              QRコードをスキャンしてグループに参加
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setShowQRScanner(true)}>
              <QrCode className="h-4 w-4 mr-2" />
              QRコードをスキャン
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* ログイン誘導テスト */}
      <Card>
        <CardHeader>
          <CardTitle>ログイン誘導</CardTitle>
          <CardDescription>
            応募時に表示されるログイン誘導
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginPrompt
            title="応募するにはログインが必要です"
            description="この求人に応募するにはログインしてください"
            action="応募"
          />
        </CardContent>
      </Card>

      {/* QRコード生成モーダル */}
      {showQRGenerator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <QRCodeGenerator
              groupId={123}
              jobTitle="サンプル求人"
              onClose={() => setShowQRGenerator(false)}
            />
          </div>
        </div>
      )}

      {/* QRコードスキャンモーダル */}
      {showQRScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <QRCodeScanner
              onScanSuccess={handleQRScanSuccess}
              onClose={() => setShowQRScanner(false)}
            />
          </div>
        </div>
      )}

      {/* ナビゲーション */}
      <Card>
        <CardHeader>
          <CardTitle>ナビゲーション</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/">ホーム</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/guest">Guestホーム</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/guest/jobs">Guest求人一覧</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/guest/join">Guestグループ参加</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/auth/login">ログイン</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/auth/signup">新規登録</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/worker">ワーカーダッシュボード</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/employer">エンプロイヤーダッシュボード</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
