'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Users, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function GuestJoinGroupPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [groupId, setGroupId] = useState<string>('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [groupInfo, setGroupInfo] = useState<any>(null);

  useEffect(() => {
    if (params.groupId) {
      setGroupId(params.groupId as string);
      // グループ情報を取得（実際の実装ではAPIを呼び出し）
      setGroupInfo({
        id: params.groupId,
        name: 'サンプルグループ',
        jobTitle: 'イベント会場スタッフ',
        memberCount: 3,
        maxMembers: 10
      });
    }
  }, [params.groupId]);

  const handleJoinGroup = async () => {
    if (!displayName.trim()) {
      toast({
        title: 'エラー',
        description: '表示名を入力してください',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-4">
        <Button asChild variant="outline">
          <Link href="/guest/join">
            <ArrowLeft className="h-4 w-4 mr-2" />
            戻る
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">グループに参加</h1>
      </div>

      {/* グループ情報 */}
      {groupInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              グループ情報
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <span className="font-medium">グループ名:</span> {groupInfo.name}
              </div>
              <div>
                <span className="font-medium">求人:</span> {groupInfo.jobTitle}
              </div>
              <div>
                <span className="font-medium">メンバー数:</span> {groupInfo.memberCount}/{groupInfo.maxMembers}名
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 参加フォーム */}
      <Card>
        <CardHeader>
          <CardTitle>参加情報を入力</CardTitle>
          <CardDescription>
            グループに参加するための情報を入力してください
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="displayName">表示名 *</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="あなたの名前を入力"
              maxLength={20}
            />
            <p className="text-xs text-gray-500 mt-1">
              グループ内で表示される名前です（最大20文字）
            </p>
          </div>

          <Button 
            onClick={handleJoinGroup}
            disabled={!displayName.trim() || isLoading}
            className="w-full"
          >
            {isLoading ? '参加中...' : 'グループに参加'}
          </Button>
        </CardContent>
      </Card>

      {/* 注意事項 */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-yellow-800 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Guestモードでの参加について
          </CardTitle>
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

      {/* ログイン誘導 */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800">より多くの機能を利用したい場合</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800">
          <p className="text-sm mb-4">
            ログインすると、求人への応募、グループの作成、プロフィール管理などの機能を利用できます。
          </p>
          <div className="flex space-x-2">
            <Button asChild size="sm">
              <Link href="/auth/login">
                ログイン
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/auth/signup">
                新規登録
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
