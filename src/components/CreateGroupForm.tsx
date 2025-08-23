'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React, { useState } from 'react';

interface CreateGroupFormProps {
  jobId: number;
  onGroupCreated: () => void;
  className?: string;
}

export function CreateGroupForm({ jobId, onGroupCreated, className }: CreateGroupFormProps) {
  const [groupName, setGroupName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    setIsSubmitting(true);
    try {
      // TODO: グループ作成の実装
      console.log('Creating group:', groupName, 'for job:', jobId);
      
      // 成功時の処理
      setGroupName('');
      onGroupCreated();
    } catch (error) {
      console.error('Failed to create group:', error);
      alert('グループの作成に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>新規グループ作成</CardTitle>
        <CardDescription>
          新しいグループを作成して、友達と一緒に応募しましょう
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="groupName">グループ名</Label>
            <Input
              id="groupName"
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="例: 友達グループA"
              required
            />
          </div>
          <Button 
            type="submit" 
            disabled={isSubmitting || !groupName.trim()}
            className="w-full"
          >
            {isSubmitting ? '作成中...' : 'グループを作成'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
