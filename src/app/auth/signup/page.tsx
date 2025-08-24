'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface SignUpFormData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  fullNameKana: string;
  birthDate: string;
  gender: string;
  address: string;
  phone: string;
}

export default function SignUpPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<SignUpFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    fullNameKana: '',
    birthDate: '',
    gender: '',
    address: '',
    phone: '',
  });
  const { toast } = useToast()

  const handleInputChange = (field: keyof SignUpFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'エラー',
        description: 'パスワードが一致しません',
        variant: 'destructive',
      });
      return false;
    }

    if (formData.password.length < 6) {
      toast({
        title: 'エラー',
        description: 'パスワードは6文字以上で入力してください',
        variant: 'destructive',
      });
      return false;
    }

    if (!formData.fullName || !formData.fullNameKana || !formData.birthDate || 
        !formData.gender || !formData.address || !formData.phone) {
      toast({
        title: 'エラー',
        description: 'すべての必須項目を入力してください',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Supabaseでユーザー登録
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            full_name_kana: formData.fullNameKana,
            birth_date: formData.birthDate,
            gender: formData.gender,
            address: formData.address,
            phone: formData.phone,
          }
        }
      });

      if (authError) {
        throw authError;
      }

      toast({
        title: '登録完了',
        description: '確認メールを送信しました。メールを確認してログインしてください。',
      });

      // ログインページにリダイレクト
      router.push('/auth/login');
    } catch (error) {
      console.error('Sign up error:', error);
      toast({
        title: 'エラー',
        description: '登録に失敗しました。もう一度お試しください。',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">アカウント作成</CardTitle>
          <CardDescription>
            すべての機能を利用するにはアカウントを作成してください
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* メールアドレス */}
            <div>
              <Label htmlFor="email">メールアドレス *</Label>
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
              <Label htmlFor="password">パスワード *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required
                placeholder="6文字以上"
              />
            </div>

            {/* パスワード確認 */}
            <div>
              <Label htmlFor="confirmPassword">パスワード確認 *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                required
                placeholder="パスワードを再入力"
              />
            </div>

            {/* 漢字フルネーム */}
            <div>
              <Label htmlFor="fullName">漢字フルネーム *</Label>
              <Input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                required
                placeholder="山田太郎"
              />
            </div>

            {/* フリガナフルネーム */}
            <div>
              <Label htmlFor="fullNameKana">フリガナフルネーム *</Label>
              <Input
                id="fullNameKana"
                type="text"
                value={formData.fullNameKana}
                onChange={(e) => handleInputChange('fullNameKana', e.target.value)}
                required
                placeholder="ヤマダタロウ"
              />
            </div>

            {/* 誕生日 */}
            <div>
              <Label htmlFor="birthDate">誕生日 *</Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={(e) => handleInputChange('birthDate', e.target.value)}
                required
              />
            </div>

            {/* 性別 */}
            <div>
              <Label htmlFor="gender">性別 *</Label>
              <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="性別を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">男性</SelectItem>
                  <SelectItem value="female">女性</SelectItem>
                  <SelectItem value="other">その他</SelectItem>
                  <SelectItem value="prefer_not_to_say">回答しない</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 住所 */}
            <div>
              <Label htmlFor="address">住所 *</Label>
              <Input
                id="address"
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                required
                placeholder="東京都渋谷区..."
              />
            </div>

            {/* 電話番号 */}
            <div>
              <Label htmlFor="phone">電話番号 *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                required
                placeholder="090-1234-5678"
              />
            </div>

            {/* 登録ボタン */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? '登録中...' : 'アカウント作成'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              すでにアカウントをお持ちですか？{' '}
              <Link href="/auth/login" className="text-blue-600 hover:underline">
                ログイン
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              または{' '}
              <Link href="/auth/guest" className="text-green-600 hover:underline">
                GUESTモードで利用
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
