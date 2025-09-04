'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import usePermissions from '@/hooks/usePermissions';
import { LoginPrompt } from '@/components/features/auth';
import GuestJobCard from '@/components/features/guest/GuestJobCard';
import { Job } from '@/types/group';
import { Search, Filter, MapPin, Clock, DollarSign } from 'lucide-react';

export default function GuestJobsPage() {
  const { canViewJobs, canApplyJobs } = usePermissions();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [wageFilter, setWageFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  // サンプルデータ（実際の実装ではAPIから取得）
  useEffect(() => {
    const sampleJobs: Job[] = [
      {
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
      },
      {
        id: 2,
        title: '配送業務',
        description: '宅配便の仕分け・配送作業',
        wage: 1000,
        jobDate: new Date('2024-02-20T09:00:00'),
        maxMembers: 5,
        status: 'ACTIVE',
        creatorId: 1,
        location: '東京都新宿区',
        requirements: '運転免許必須',
        createdAt: new Date()
      }
    ];

    setJobs(sampleJobs);
    setFilteredJobs(sampleJobs);
    setIsLoading(false);
  }, []);

  // フィルタリング処理
  useEffect(() => {
    let filtered = jobs;

    if (searchTerm) {
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (wageFilter) {
      const minWage = parseInt(wageFilter);
      filtered = filtered.filter(job => job.wage >= minWage);
    }

    if (locationFilter) {
      filtered = filtered.filter(job => 
        job.location?.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    setFilteredJobs(filtered);
  }, [jobs, searchTerm, wageFilter, locationFilter]);

  const handleJoinGroup = (jobId: number) => {
    // グループ参加処理
    console.log('Join group for job:', jobId);
  };

  const handleViewDetails = (jobId: number) => {
    // 詳細表示処理
    console.log('View details for job:', jobId);
  };

  if (!canViewJobs) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <LoginPrompt 
          title="仕事情報の閲覧にはログインが必要です"
          description="求人情報を確認するにはログインしてください"
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">求人情報</h1>
        <p className="text-gray-600">
          Guestモードで仕事情報を確認できます
        </p>
      </div>

      {/* 検索・フィルター */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            検索・フィルター
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">キーワード検索</label>
              <Input
                placeholder="職種、場所、説明で検索"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">最低時給</label>
              <Select value={wageFilter} onValueChange={setWageFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="選択してください" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">指定なし</SelectItem>
                  <SelectItem value="800">800円以上</SelectItem>
                  <SelectItem value="1000">1000円以上</SelectItem>
                  <SelectItem value="1200">1200円以上</SelectItem>
                  <SelectItem value="1500">1500円以上</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">勤務地</label>
              <Input
                placeholder="勤務地で検索"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              />
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={() => {
                  setSearchTerm('');
                  setWageFilter('');
                  setLocationFilter('');
                }}
                variant="outline"
                className="w-full"
              >
                <Filter className="h-4 w-4 mr-2" />
                リセット
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 結果表示 */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            検索結果: {filteredJobs.length}件
          </h2>
          {!canApplyJobs && (
            <div className="text-sm text-yellow-600 bg-yellow-50 px-3 py-1 rounded">
              応募するにはログインが必要です
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">条件に合う求人が見つかりませんでした</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <GuestJobCard
                key={job.id}
                job={job}
                onJoinGroup={handleJoinGroup}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
