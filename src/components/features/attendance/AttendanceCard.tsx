'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, Play, Square, DollarSign, CheckCircle } from 'lucide-react'
import { startAttendance, endAttendance } from '@/lib/actions/attendance'
import { useAuth } from '@/contexts/AuthContext'
import { Job } from '@/types/group'

interface AttendanceCardProps {
  job: Job
  activeAttendance?: any
  completedAttendances?: any[]
  onAttendanceUpdate: () => void
}

export function AttendanceCard({ 
  job, 
  activeAttendance, 
  completedAttendances = [], 
  onAttendanceUpdate 
}: AttendanceCardProps) {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleStartAttendance = async () => {
    if (!user?.id) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await startAttendance(job.id, user.id)
      
      if (result.success) {
        onAttendanceUpdate()
      } else {
        setError(result.error || '勤務開始に失敗しました')
      }
    } catch (err) {
      setError('勤務開始に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEndAttendance = async () => {
    if (!user?.id) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await endAttendance(job.id, user.id)
      
      if (result.success) {
        onAttendanceUpdate()
      } else {
        setError(result.error || '勤務終了に失敗しました')
      }
    } catch (err) {
      setError('勤務終了に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatDuration = (hours: number) => {
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    return `${h}時間${m}分`
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(amount)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          勤務管理
        </CardTitle>
        <CardDescription>
          {job.title} - {formatDate(job.jobDate)}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* 勤務中の場合 */}
        {activeAttendance && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-blue-900">勤務中</h3>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                開始: {formatTime(activeAttendance.startTime)}
              </Badge>
            </div>
            <p className="text-sm text-blue-700 mb-3">
              勤務開始時刻: {formatTime(activeAttendance.startTime)}
            </p>
            <Button
              onClick={handleEndAttendance}
              disabled={isLoading}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              <Square className="h-4 w-4 mr-2" />
              {isLoading ? '処理中...' : '勤務終了'}
            </Button>
          </div>
        )}

        {/* 勤務中でない場合 */}
        {!activeAttendance && (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">勤務開始</h3>
            <p className="text-sm text-gray-600 mb-3">
              時給: {formatCurrency(job.wage)}
            </p>
            <Button
              onClick={handleStartAttendance}
              disabled={isLoading}
              className="w-full"
            >
              <Play className="h-4 w-4 mr-2" />
              {isLoading ? '処理中...' : '勤務開始'}
            </Button>
          </div>
        )}

        {/* 勤務履歴 */}
        {completedAttendances.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">勤務履歴</h3>
            <div className="space-y-2">
              {completedAttendances.map((attendance) => (
                <div
                  key={attendance.id}
                  className="p-3 bg-white border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">
                      {formatDate(attendance.startTime)}
                    </span>
                    <div className="flex items-center gap-2">
                      {attendance.isPaid && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          支払済み
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTime(attendance.startTime)} - {formatTime(attendance.endTime)}
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      {formatCurrency(attendance.totalWage || 0)}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    勤務時間: {attendance.totalHours ? formatDuration(attendance.totalHours) : '計算中...'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
