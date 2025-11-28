import type { Group, GroupMember, ApplicationParticipationStatus } from '@/types/application'

/**
 * グループから承認済みメンバーを取得
 */
export function getApprovedMembers(group: Group): GroupMember[] {
  return group.members.filter(m => m.status === 'approved')
}

/**
 * グループから応募に参加しているメンバーを取得
 */
export function getParticipatingMembers(group: Group): GroupMember[] {
  const approvedMembers = getApprovedMembers(group)
  return approvedMembers.filter(
    m => m.applicationStatus === 'participating' || 
         (m.applicationStatus === undefined && m.status === 'approved') // 既存データの互換性
  )
}

/**
 * メンバーの応募参加ステータスを取得（既存データの互換性を考慮）
 */
export function getMemberApplicationStatus(member: GroupMember): ApplicationParticipationStatus {
  return member.applicationStatus || 
         (member.status === 'approved' ? 'participating' : 'not_participating')
}

/**
 * グループの応募送信可否を判定
 */
export function canSubmitApplication(group: Group): {
  canSubmit: boolean
  approvedCount: number
  participatingCount: number
  requiredCount: number
} {
  const approvedMembers = getApprovedMembers(group)
  const participatingMembers = getParticipatingMembers(group)
  const requiredCount = group.requiredCount || approvedMembers.length || 0
  
  return {
    canSubmit: approvedMembers.length >= requiredCount && participatingMembers.length >= requiredCount,
    approvedCount: approvedMembers.length,
    participatingCount: participatingMembers.length,
    requiredCount,
  }
}

