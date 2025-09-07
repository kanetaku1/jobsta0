'use client'

import { useState, useEffect } from 'react'
import { getJobWithGroups } from '@/app/worker/actions';
import { Button } from '@/components/common';
import { JobDetailCard } from '@/components/features/dashboard';
import { AttendanceCard } from '@/components/features/attendance';
import { getJobAttendanceStatus } from '@/lib/actions/attendance';
import { useAuth } from '@/contexts/AuthContext';
import { notFound } from 'next/navigation';

export default function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user } = useAuth()
  const [job, setJob] = useState<any>(null)
  const [groups, setGroups] = useState<any[]>([])
  const [attendanceStatus, setAttendanceStatus] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [jobId, setJobId] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      if (!jobId) return
      
      setIsLoading(true)
      try {
        const result = await getJobWithGroups(jobId, user?.id)
        
        if (result.success && result.data) {
          setJob(result.data.job)
          setGroups(result.data.groups)
          setAttendanceStatus(result.data.attendanceStatus)
        } else {
          console.error('Failed to load job data:', result.error)
          // エラーの場合は404ページに遷移
          notFound()
        }
      } catch (err) {
        console.error('Failed to load job data:', err)
        notFound()
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [jobId, user])

  useEffect(() => {
    const initParams = async () => {
      const resolvedParams = await params
      setJobId(resolvedParams.id)
    }
    initParams()
  }, [params])

  const handleAttendanceUpdate = () => {
    // 勤務状況を再取得
    if (jobId && user?.id) {
      getJobAttendanceStatus(parseInt(jobId), user.id).then(result => {
        if (result.success) {
          setAttendanceStatus(result)
        }
      })
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-2 text-gray-600">読み込み中...</p>
      </div>
    )
  }

  if (!job) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <JobDetailCard job={job} groups={groups} />
      
      {/* 勤務管理カード（認証済みユーザーのみ） */}
      {attendanceStatus && (
        <AttendanceCard
          job={job}
          activeAttendance={attendanceStatus.activeAttendance}
          completedAttendances={attendanceStatus.completedAttendances}
          onAttendanceUpdate={handleAttendanceUpdate}
        />
      )}
    </div>
  );
}
