'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { getJobInterestForUser, setJobInterest, getCurrentUserId } from '@/lib/localStorage'
import type { JobInterestStatus } from '@/types/application'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

type JobInterestButtonProps = {
  jobId: string
}

export function JobInterestButton({ jobId }: JobInterestButtonProps) {
  const [status, setStatus] = useState<JobInterestStatus>('none')
  const userId = getCurrentUserId()

  useEffect(() => {
    const currentStatus = getJobInterestForUser(jobId, userId)
    setStatus(currentStatus)
  }, [jobId, userId])

  const handleToggle = () => {
    const newStatus: JobInterestStatus = status === 'interested' ? 'none' : 'interested'
    setJobInterest(jobId, userId, newStatus)
    setStatus(newStatus)
  }

  if (status === 'interested') {
    return (
      <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
        <Heart size={14} className="mr-1 fill-current" />
        この求人に興味あり
      </Badge>
    )
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleToggle}
      className="text-gray-600 border-gray-300 hover:bg-green-50 hover:text-green-600 hover:border-green-300"
    >
      <Heart size={16} className="mr-1" />
      この求人に興味あり
    </Button>
  )
}

