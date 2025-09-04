'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { updateUserProfile } from '@/lib/actions/auth';
import { useState } from 'react';

interface UserProfileProps {
  onUpdate?: () => void;
}

export default function UserProfile({ onUpdate }: UserProfileProps) {
  const { prismaUser, user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: prismaUser?.name || '',
    phone: prismaUser?.phone || '',
    address: prismaUser?.address || '',
    emergencyContact: prismaUser?.emergencyContact || '',
    companyName: prismaUser?.companyName || '',
    companyAddress: prismaUser?.companyAddress || '',
    companyPhone: prismaUser?.companyPhone || '',
  });

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prismaUser) {
      toast({
        title: 'エラー',
        description: 'ユーザー情報が見つかりません',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      await updateUserProfile(prismaUser.id, formData);
      
      toast({
        title: '更新完了',
        description: 'プロフィールが更新されました',
      });

      onUpdate?.();
    } catch (error) {
      console.error('Profile update error:', error);
      toast({
        title: 'エラー',
        description: 'プロフィールの更新に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!prismaUser) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>プロフィール</CardTitle>
          <CardDescription>ユーザー情報を読み込み中...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>プロフィール設定</CardTitle>
        <CardDescription>
          あなたの情報を更新して、より良いマッチングを実現しましょう
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 基本情報 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">基本情報</h3>
            
            <div>
              <Label htmlFor="name">名前</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="山田太郎"
              />
            </div>

            <div>
              <Label htmlFor="phone">電話番号</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="090-1234-5678"
              />
            </div>

            <div>
              <Label htmlFor="address">住所</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="東京都渋谷区..."
              />
            </div>

            <div>
              <Label htmlFor="emergencyContact">緊急連絡先</Label>
              <Input
                id="emergencyContact"
                value={formData.emergencyContact}
                onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                placeholder="090-9876-5432"
              />
            </div>
          </div>

          {/* 会社情報（EMPLOYERの場合のみ表示） */}
          {prismaUser.userType === 'EMPLOYER' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">会社情報</h3>
              
              <div>
                <Label htmlFor="companyName">会社名</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  placeholder="株式会社サンプル"
                />
              </div>

              <div>
                <Label htmlFor="companyAddress">会社住所</Label>
                <Input
                  id="companyAddress"
                  value={formData.companyAddress}
                  onChange={(e) => handleInputChange('companyAddress', e.target.value)}
                  placeholder="東京都新宿区..."
                />
              </div>

              <div>
                <Label htmlFor="companyPhone">会社電話番号</Label>
                <Input
                  id="companyPhone"
                  value={formData.companyPhone}
                  onChange={(e) => handleInputChange('companyPhone', e.target.value)}
                  placeholder="03-1234-5678"
                />
              </div>
            </div>
          )}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? '更新中...' : 'プロフィールを更新'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
