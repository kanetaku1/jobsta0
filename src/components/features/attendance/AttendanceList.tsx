'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, DollarSign, CheckCircle, XCircle, MapPin, Calendar } from 'lucide-react'

interface AttendanceListProps {
  attendances: any[]
  showJobInfo?: boolean
}

export function AttendanceList({ attendances, showJobInfo = true }: AttendanceListProps) {
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

  const getStatusBadge = (attendance: any) => {
    if (attendance.endTime) {
      return attendance.isPaid ? (
        <Badge variant="outline" className="text-green-600 border-green-600">
          <CheckCircle className="h-3 w-3 mr-1" />
          支払済み
        </Badge>
      ) : (
        <Badge variant="outline" className="text-orange-600 border-orange-600">
          <XCircle className="h-3 w-3 mr-1" />
          未払い
        </Badge>
      )
    } else {
      return (
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          勤務中
        </Badge>
      )
    }
  }

  if (attendances.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">勤務履歴がありません</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {attendances.map((attendance) => (
        <Card key={attendance.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {showJobInfo ? attendance.job?.title : '勤務記録'}
              </CardTitle>
              {getStatusBadge(attendance)}
            </div>
            {showJobInfo && (
              <CardDescription className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(attendance.job?.jobDate)}
                </span>
                {attendance.job?.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {attendance.job.location}
                  </span>
                )}
              </CardDescription>
            )}
          </CardHeader>
          
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 勤務時間 */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">勤務時間</span>
                </div>
                <div className="text-lg font-semibold">
                  {attendance.endTime ? (
                    <>
                      {formatTime(attendance.startTime)} - {formatTime(attendance.endTime)}
                      {attendance.totalHours && (
                        <div className="text-sm text-gray-500">
                          ({formatDuration(attendance.totalHours)})
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {formatTime(attendance.startTime)} 開始
                      <div className="text-sm text-blue-600">勤務中</div>
                    </>
                  )}
                </div>
              </div>

              {/* 給与 */}
              {attendance.endTime && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <DollarSign className="h-4 w-4" />
                    <span className="font-medium">給与</span>
                  </div>
                  <div className="text-lg font-semibold text-green-600">
                    {attendance.totalWage ? formatCurrency(attendance.totalWage) : '計算中...'}
                  </div>
                  {attendance.job?.wage && (
                    <div className="text-sm text-gray-500">
                      時給: {formatCurrency(attendance.job.wage)}
                    </div>
                  )}
                </div>
              )}

              {/* 日付 */}
              <div className="space-y-1">
                <div className="text-sm text-gray-600 font-medium">勤務日</div>
                <div className="text-lg font-semibold">
                  {formatDate(attendance.startTime)}
                </div>
                <div className="text-sm text-gray-500">
                  {attendance.updatedAt && (
                    <>更新: {formatTime(attendance.updatedAt)}</>
                  )}
                </div>
              </div>
            </div>

            {/* ユーザー情報（管理者用） */}
            {attendance.user && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">従業員:</span> {attendance.user.name} ({attendance.user.email})
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
