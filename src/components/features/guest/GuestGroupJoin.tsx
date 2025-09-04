'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useState } from 'react';
import { QrCode, Users, UserPlus } from 'lucide-react';

interface GuestGroupJoinProps {
  jobId: number;
  onJoinGroup?: (groupId: number, displayName: string) => void;
  onScanQR?: () => void;
}

export default function GuestGroupJoin({ jobId, onJoinGroup, onScanQR }: GuestGroupJoinProps) {
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState('');
  const [groupId, setGroupId] = useState('');

  const handleJoinByCode = () => {
    if (!displayName.trim()) {
      toast({
        title: 'エラー',
        description: '表示名を入力してください',
        variant: 'destructive',
      });
      return;
    }

    if (!groupId.trim()) {
      toast({
        title: 'エラー',
        description: 'グループIDを入力してください',
        variant: 'destructive',
      });
      return;
    }

    const groupIdNum = parseInt(groupId);
    if (isNaN(groupIdNum)) {
      toast({
        title: 'エラー',
        description: '有効なグループIDを入力してください',
        variant: 'destructive',
      });
      return;
    }

    onJoinGroup?.(groupIdNum, displayName.trim());
  };

  const handleQRScan = () => {
    onScanQR?.();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          グループに参加
        </CardTitle>
        <CardDescription>
          友達と一緒に応募するグループに参加できます
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* 表示名入力 */}
        <div className="space-y-2">
          <Label htmlFor="displayName">表示名 *</Label>
          <Input
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="あなたの名前を入力"
            maxLength={20}
          />
          <p className="text-xs text-gray-500">
            グループ内で表示される名前です（最大20文字）
          </p>
        </div>

        {/* 参加方法選択 */}
        <div className="space-y-4">
          <h3 className="font-medium">参加方法を選択</h3>
          
          {/* QRコードスキャン */}
          <div className="space-y-2">
            <Button 
              onClick={handleQRScan}
              variant="outline" 
              className="w-full justify-start"
            >
              <QrCode className="h-4 w-4 mr-2" />
              QRコードをスキャン
            </Button>
            <p className="text-xs text-gray-500">
              グループリーダーが発行したQRコードをスキャンして参加
            </p>
          </div>

          {/* グループID入力 */}
          <div className="space-y-2">
            <Label htmlFor="groupId">グループID</Label>
            <div className="flex space-x-2">
              <Input
                id="groupId"
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                placeholder="グループIDを入力"
                className="flex-1"
              />
              <Button 
                onClick={handleJoinByCode}
                disabled={!displayName.trim() || !groupId.trim()}
              >
                <UserPlus className="h-4 w-4 mr-1" />
                参加
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              グループリーダーから教えてもらったIDを入力
            </p>
          </div>
        </div>

        {/* 注意事項 */}
        <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
          <p className="text-blue-800">
            <strong>Guestモードでの参加:</strong>
            <br />
            • グループの閲覧と参加のみ可能です
            <br />
            • 応募するにはログインが必要です
            <br />
            • 参加後、ログインすると正式なメンバーになります
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
