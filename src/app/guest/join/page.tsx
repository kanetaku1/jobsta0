'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import usePermissions from '@/hooks/usePermissions';
import GuestGroupJoin from '@/components/features/guest/GuestGroupJoin';
import QRCodeScanner from '@/components/features/qr/QRCodeScanner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, Users, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function GuestJoinPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { canJoinGroups } = usePermissions();
  const [showQRScanner, setShowQRScanner] = useState(false);

  const handleJoinGroup = async (groupId: number, displayName: string) => {
    try {
      // グループ参加処理（実際の実装ではAPIを呼び出し）
      console.log('Joining group:', groupId, 'with display name:', displayName);
      
      toast({
        title: 'グループに参加しました',
        description: `「${displayName}」としてグループに参加しました`,
      });

      // グループ詳細ページにリダイレクト
      router.push(`/guest/groups/${groupId}`);
    } catch (error) {
      console.error('Join group error:', error);
      toast({
        title: 'エラー',
        description: 'グループへの参加に失敗しました',
        variant: 'destructive',
      });
    }
  };

  const handleQRScan = () => {
    setShowQRScanner(true);
  };

  const handleQRScanSuccess = (data: any) => {
    console.log('QR scan success:', data);
    
    if (data.type === 'group_join' && data.groupId) {
      setShowQRScanner(false);
      
      // グループIDを自動入力して参加処理
      const displayName = prompt('表示名を入力してください:');
      if (displayName) {
        handleJoinGroup(data.groupId, displayName);
      }
    } else {
      toast({
        title: 'エラー',
        description: '無効なQRコードです',
        variant: 'destructive',
      });
    }
  };

  const handleCloseQRScanner = () => {
    setShowQRScanner(false);
  };

  if (!canJoinGroups) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">グループへの参加はできません</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showQRScanner) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-4">
          <Button 
            onClick={handleCloseQRScanner}
            variant="outline"
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            戻る
          </Button>
        </div>
        <QRCodeScanner
          onScanSuccess={handleQRScanSuccess}
          onClose={handleCloseQRScanner}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">グループに参加</h1>
        <p className="text-gray-600">
          友達と一緒に応募するグループに参加できます
        </p>
      </div>

      {/* 参加方法選択 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* QRコードスキャン */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              QRコードで参加
            </CardTitle>
            <CardDescription>
              グループリーダーが発行したQRコードをスキャン
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <QrCode className="h-8 w-8 text-blue-600" />
                </div>
                <p className="text-sm text-gray-600">
                  カメラでQRコードをスキャンして簡単に参加
                </p>
              </div>
              <Button 
                onClick={handleQRScan}
                className="w-full"
              >
                QRコードをスキャン
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* グループID入力 */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              グループIDで参加
            </CardTitle>
            <CardDescription>
              グループリーダーから教えてもらったIDを入力
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GuestGroupJoin
              jobId={0} // 実際の実装では適切なjobIdを渡す
              onJoinGroup={handleJoinGroup}
              onScanQR={handleQRScan}
            />
          </CardContent>
        </Card>
      </div>

      {/* 参加方法の説明 */}
      <Card>
        <CardHeader>
          <CardTitle>参加方法の説明</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <QrCode className="h-4 w-4" />
                QRコードでの参加
              </h3>
              <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                <li>グループリーダーからQRコードを受け取る</li>
                <li>「QRコードをスキャン」をタップ</li>
                <li>カメラでQRコードを読み取る</li>
                <li>表示名を入力して参加</li>
              </ol>
            </div>
            
            <div>
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <Users className="h-4 w-4" />
                グループIDでの参加
              </h3>
              <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                <li>グループリーダーからグループIDを教えてもらう</li>
                <li>表示名を入力する</li>
                <li>グループIDを入力する</li>
                <li>「参加」ボタンをタップ</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 注意事項 */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-yellow-800">Guestモードでの参加について</CardTitle>
        </CardHeader>
        <CardContent className="text-yellow-800">
          <ul className="space-y-2 text-sm">
            <li>• グループの閲覧と参加のみ可能です</li>
            <li>• 応募するにはログインが必要です</li>
            <li>• 参加後、ログインすると正式なメンバーになります</li>
            <li>• グループ内での発言や活動は制限される場合があります</li>
          </ul>
        </CardContent>
      </Card>

      {/* ナビゲーション */}
      <div className="flex justify-center space-x-4">
        <Button asChild variant="outline">
          <Link href="/guest">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Guestホームに戻る
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/guest/jobs">
            求人一覧を見る
          </Link>
        </Button>
      </div>
    </div>
  );
}
