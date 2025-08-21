import { getGroup } from '@/app/actions'
import { WaitingRoom } from '@/components/features/dashboard'
import type { WaitingRoomWithMembers } from '@/types/group'
import { notFound } from 'next/navigation'

export default async function GroupDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  const group = await getGroup(parseInt(id))
  
  if (!group) notFound()

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">応募待機ルーム</h1>
        <p className="text-gray-600">求人: {group.waitingRoom.job.title}</p>
      </div>
      <WaitingRoom waitingRoom={group.waitingRoom as WaitingRoomWithMembers} currentUserId={1} />
    </div>
  )
}