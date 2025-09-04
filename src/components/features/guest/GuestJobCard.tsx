'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Job } from '@/types/group';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import Link from 'next/link';

interface GuestJobCardProps {
  job: Job;
  onJoinGroup?: (jobId: number) => void;
  onViewDetails?: (jobId: number) => void;
}

export default function GuestJobCard({ job, onJoinGroup, onViewDetails }: GuestJobCardProps) {
  const formatDate = (date: Date) => {
    return format(new Date(date), 'yyyy年MM月dd日(E) HH:mm', { locale: ja });
  };

  const formatWage = (wage: number) => {
    return `¥${wage.toLocaleString()}/時`;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{job.title}</CardTitle>
            <CardDescription className="mt-1">
              {job.location && (
                <span className="text-sm text-gray-600">📍 {job.location}</span>
              )}
            </CardDescription>
          </div>
          <Badge variant={job.status === 'ACTIVE' ? 'default' : 'secondary'}>
            {job.status === 'ACTIVE' ? '募集中' : '停止中'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* 基本情報 */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">時給</span>
            <span className="font-semibold text-lg text-green-600">
              {formatWage(job.wage)}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">勤務日時</span>
            <span className="font-medium">{formatDate(job.jobDate)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">募集人数</span>
            <span className="font-medium">{job.maxMembers}名</span>
          </div>
        </div>

        {/* 説明 */}
        {job.description && (
          <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
            {job.description}
          </div>
        )}

        {/* 要件 */}
        {job.requirements && (
          <div className="text-sm">
            <span className="font-medium text-gray-600">要件:</span>
            <p className="text-gray-700 mt-1">{job.requirements}</p>
          </div>
        )}

        {/* アクションボタン */}
        <div className="flex space-x-2 pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={() => onViewDetails?.(job.id)}
            className="flex-1"
          >
            詳細を見る
          </Button>
          <Button 
            onClick={() => onJoinGroup?.(job.id)}
            className="flex-1"
          >
            グループに参加
          </Button>
        </div>

        {/* Guestモード注意書き */}
        <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm">
          <p className="text-yellow-800">
            <strong>Guestモード:</strong> グループへの参加のみ可能です。
            応募するにはログインが必要です。
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
