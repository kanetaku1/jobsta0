'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React, { useState } from 'react';

interface InviteFormProps {
  groupId: number;
}

export function InviteForm({ groupId }: InviteFormProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: 招待機能の実装
      console.log('Inviting user with email:', email, 'to group:', groupId);
      
      // 成功時の処理
      setEmail('');
      alert('招待メールを送信しました');
    } catch (error) {
      console.error('Failed to send invitation:', error);
      alert('招待の送信に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>友達を招待</CardTitle>
        <CardDescription>
          友達のメールアドレスを入力して、この求人に招待してください
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">メールアドレス</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="friend@example.com"
              required
            />
          </div>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? '送信中...' : '招待を送信'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
