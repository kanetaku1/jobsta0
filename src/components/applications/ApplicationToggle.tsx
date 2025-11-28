'use client'

import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import type { ApplicationParticipationStatus } from '@/types/application'

type ApplicationToggleProps = {
  memberId: string
  memberName: string
  currentStatus: ApplicationParticipationStatus
  isCurrentUser: boolean // 現在のユーザーかどうか
  disabled?: boolean
  onChange: (memberId: string, status: ApplicationParticipationStatus) => void
}

export function ApplicationToggle({
  memberId,
  memberName,
  currentStatus,
  isCurrentUser,
  disabled = false,
  onChange
}: ApplicationToggleProps) {
  const isParticipating = currentStatus === 'participating'
  
  const handleToggle = (checked: boolean) => {
    const newStatus: ApplicationParticipationStatus = checked ? 'participating' : 'not_participating'
    onChange(memberId, newStatus)
  }

  // 自分自身でない場合は操作不可
  if (!isCurrentUser) {
    return (
      <div className="flex items-center gap-3">
        <Label className="flex-1">{memberName}</Label>
        <div className="flex items-center gap-2">
          <Switch checked={isParticipating} disabled />
          <span className={`text-sm ${isParticipating ? 'text-green-600' : 'text-gray-500'}`}>
            {isParticipating ? '参加' : '不参加'}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <Label className="flex-1">{memberName}</Label>
      <div className="flex items-center gap-2">
        <Switch
          checked={isParticipating}
          disabled={disabled || currentStatus === 'pending'}
          onCheckedChange={handleToggle}
        />
        <span className={`text-sm ${isParticipating ? 'text-green-600' : 'text-gray-500'}`}>
          {isParticipating ? '参加' : '不参加'}
        </span>
      </div>
    </div>
  )
}

