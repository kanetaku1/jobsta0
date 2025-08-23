import { Group } from '@/types/group'

interface ApplicationListProps {
  groups: Group[]
}

export function ApplicationList({ groups }: ApplicationListProps) {
  if (!groups || groups.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">まだ応募がありません</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <div key={group.id} className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold">グループ: {group.name}</h3>
            <span className="text-sm text-gray-500">
              リーダー: {group.leader?.name}
            </span>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium">メンバー:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {group.members?.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <span className="font-medium">{member.user?.name}</span>
                    <span className="text-sm text-gray-500 ml-2">
                      ({member.status})
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {member.user?.phone && `📞 ${member.user.phone}`}
                  </div>
                </div>
              ))}
            </div>
            
            {group.applications && group.applications.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded">
                <h4 className="font-medium text-blue-800">応募情報</h4>
                <div className="text-sm text-blue-700">
                  {group.applications.map((app) => (
                    <div key={app.id}>
                      提出日: {app.submittedAt.toLocaleDateString('ja-JP')} | 
                      状態: {app.status}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
