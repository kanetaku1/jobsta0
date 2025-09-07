'use client'

import { useState, useEffect } from 'react'
import { AuthGuard } from '@/components/features/auth'
import { AttendanceList } from '@/components/features/attendance'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, DollarSign, TrendingUp } from 'lucide-react'
import { getUserAttendances } from '@/lib/actions/attendance'
import { useAuth } from '@/contexts/AuthContext'

export default function WorkerAttendancePage() {
  const { user } = useAuth()
  const [attendances, setAttendances] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadAttendances = async () => {
    if (!user?.id) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await getUserAttendances(user.id)
      
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
    loadAttendances()
  }, [user])

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
    
    return {
      totalHours,
      totalWage,
      paidWage,
      unpaidWage: totalWage - paidWage,
      workDays: completedAttendances.length
    }
  }

  const stats = calculateStats()

  return (
    <AuthGuard requireAuth={true} userType="WORKER">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">勤務管理</h1>
          <p className="text-gray-600">あなたの勤務履歴と給与情報を確認できます</p>
        </div>

        {/* 統計情報 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(stats.paidWage)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">勤務日数</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.workDays}日
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 未払い給与の警告 */}
        {stats.unpaidWage > 0 && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-orange-800">
                <DollarSign className="h-5 w-5" />
                <span className="font-medium">未払い給与があります</span>
              </div>
              <p className="text-orange-700 mt-1">
                未払い金額: {formatCurrency(stats.unpaidWage)}
              </p>
            </CardContent>
          </Card>
        )}

        {/* 勤務履歴 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>勤務履歴</CardTitle>
                <CardDescription>
                  過去の勤務記録と給与情報
                </CardDescription>
              </div>
              <Button onClick={loadAttendances} variant="outline" size="sm">
                更新
              </Button>
            </div>
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
                <Button onClick={loadAttendances} className="mt-2" variant="outline">
                  再試行
                </Button>
              </div>
            ) : (
              <AttendanceList attendances={attendances} />
            )}
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  )
}
