'use client'

import { useState, useEffect } from 'react'
import { AuthGuard } from '@/components/features/auth'
import { AttendanceList } from '@/components/features/attendance'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Clock, DollarSign, Users, CheckCircle } from 'lucide-react'
import { getAllAttendances, updatePaymentStatus } from '@/lib/actions/attendance'
import { useAuth } from '@/contexts/AuthContext'

export default function EmployerAttendancePage() {
  const { user } = useAuth()
  const [attendances, setAttendances] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedJobId, setSelectedJobId] = useState<string>('all')

  const loadAttendances = async (jobId?: number) => {
    if (!user?.id) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await getAllAttendances(jobId)
      
      if (result.success) {
        setAttendances(result.attendances)
      } else {
        setError('勤務履歴の取得に失敗しました')
      }
    } catch (err) {
      setError('勤務履歴の取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const jobId = selectedJobId === 'all' ? undefined : parseInt(selectedJobId)
    loadAttendances(jobId)
  }, [user, selectedJobId])

  const handlePaymentUpdate = async (attendanceId: number, isPaid: boolean) => {
    try {
      const result = await updatePaymentStatus(attendanceId, isPaid)
      
      if (result.success) {
        // リストを更新
        setAttendances(prev => 
          prev.map(attendance => 
            attendance.id === attendanceId 
              ? { ...attendance, isPaid }
              : attendance
          )
        )
      } else {
        setError('支払い状況の更新に失敗しました')
      }
    } catch (err) {
      setError('支払い状況の更新に失敗しました')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(amount)
  }

  const calculateStats = () => {
    const completedAttendances = attendances.filter(a => a.endTime)
    const totalHours = completedAttendances.reduce((sum, a) => sum + (a.totalHours || 0), 0)
    const totalWage = completedAttendances.reduce((sum, a) => sum + (a.totalWage || 0), 0)
    const paidWage = completedAttendances
      .filter(a => a.isPaid)
      .reduce((sum, a) => sum + (a.totalWage || 0), 0)
    const uniqueUsers = new Set(attendances.map(a => a.userId)).size
    
    return {
      totalHours,
      totalWage,
      paidWage,
      unpaidWage: totalWage - paidWage,
      workDays: completedAttendances.length,
      uniqueUsers
    }
  }

  const stats = calculateStats()

  // 求人一覧を取得（フィルター用）
  const jobOptions = Array.from(
    new Set(attendances.map(a => a.job).filter(Boolean))
  ).map(job => ({
    id: job.id,
    title: job.title
  }))

  return (
    <AuthGuard requireAuth={true} userType="EMPLOYER">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">勤務管理</h1>
          <p className="text-gray-600">従業員の勤務履歴と給与管理</p>
        </div>

        {/* フィルター */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">求人でフィルター:</label>
              <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="求人を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべての求人</SelectItem>
                  {jobOptions.map(job => (
                    <SelectItem key={job.id} value={job.id.toString()}>
                      {job.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={() => loadAttendances(selectedJobId === 'all' ? undefined : parseInt(selectedJobId))} variant="outline">
                更新
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 統計情報 */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">総勤務時間</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.floor(stats.totalHours)}時間{Math.round((stats.totalHours % 1) * 60)}分
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">総給与</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.totalWage)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">支払済み</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(stats.paidWage)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">未払い</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(stats.unpaidWage)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">従業員数</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.uniqueUsers}人
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 勤務履歴 */}
        <Card>
          <CardHeader>
            <CardTitle>勤務履歴</CardTitle>
            <CardDescription>
              従業員の勤務記録と支払い管理
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-gray-600">読み込み中...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600">{error}</p>
                <Button onClick={() => loadAttendances(selectedJobId === 'all' ? undefined : parseInt(selectedJobId))} className="mt-2" variant="outline">
                  再試行
                </Button>
              </div>
            ) : (
              <AttendanceList attendances={attendances} showJobInfo={true} />
            )}
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  )
}
