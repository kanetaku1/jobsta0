'use client'

import { CheckCircle, Clock, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ApplicationToggle } from '@/components/applications/ApplicationToggle'
import { getGroup } from '@/lib/actions/groups'
import { getCurrentUserFromSession } from '@/lib/auth/session-utils'
import { useToast } from '@/components/ui/use-toast'
import { getMemberApplicationStatus } from '@/lib/utils/group'
import type { Group, GroupMember, ApplicationParticipationStatus } from '@/types/application'

type GroupMemberListProps = {
  group: Group
  onGroupUpdate?: (updatedGroup: Group) => void
}

export function GroupMemberList({ group, onGroupUpdate }: GroupMemberListProps) {
  const { toast } = useToast()
  const currentUser = getCurrentUserFromSession()
  const currentUserId = currentUser?.id

  const handleStatusChange = async (memberId: string, status: ApplicationParticipationStatus) => {
    try {
      // 応募参加ステータスを更新
      const { updateGroupMemberApplicationStatus } = await import('@/lib/actions/groups')
      const success = await updateGroupMemberApplicationStatus(group.id, memberId, status)
      
      if (success) {
        // グループ情報を再取得して表示を更新
        const updatedGroup = await getGroup(group.id)
        if (updatedGroup) {
          onGroupUpdate?.(updatedGroup)
        }
        
        toast({
          title: '更新しました',
          description: status === 'participating' ? '応募に参加します' : '応募に参加しません',
        })
      } else {
        toast({
          title: 'エラー',
          description: '応募参加ステータスの更新に失敗しました',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'エラー',
        description: '応募参加ステータスの更新に失敗しました',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        メンバーの応募参加状況
      </h3>
      
      <div className="space-y-3">
        {group.members.map((member: GroupMember) => {
          const isCurrentUser = member.userId === currentUserId
          const applicationStatus = getMemberApplicationStatus(member)
          
          return (
            <div
              key={member.id}
              className="p-4 border border-gray-200 rounded-lg bg-white"
            >
              <div className="flex items-center justify-between mb-3">
                <ApplicationToggle
                  memberId={member.id}
                  memberName={member.name}
                  currentStatus={applicationStatus}
                  isCurrentUser={isCurrentUser}
                  disabled={member.status !== 'approved'} // グループ参加が承認されていない場合は操作不可
                  onChange={handleStatusChange}
                />
              </div>
              
              {/* グループ参加ステータス */}
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-500">グループ参加:</span>
                {member.status === 'pending' && (
                  <Badge variant="default" className="bg-yellow-100 text-yellow-800 border-yellow-300 text-xs">
                    <Clock size={10} className="mr-1" />
                    承認待ち
                  </Badge>
                )}
                {member.status === 'approved' && (
                  <Badge variant="default" className="bg-green-100 text-green-800 border-green-300 text-xs">
                    <CheckCircle size={10} className="mr-1" />
                    承認済み
                  </Badge>
                )}
                {member.status === 'rejected' && (
                  <Badge variant="outline" className="text-red-600 border-red-300 text-xs">
                    <XCircle size={10} className="mr-1" />
                    辞退
                  </Badge>
                )}
              </div>
            </div>
          )
        })}
      </div>
      
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          💡 グループに参加した後、各メンバーは自分のトグルで応募への参加/不参加を選択できます。
        </p>
      </div>
    </div>
  )
}

