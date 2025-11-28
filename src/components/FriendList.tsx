'use client'

import { useState, useEffect } from 'react'
import { Check, Heart } from 'lucide-react'
import type { Friend, JobInterestStatus } from '@/types/application'
import { getFriendsWithJobInterest, getCurrentUserId } from '@/lib/localStorage'
import { Badge } from '@/components/ui/badge'

type FriendWithInterest = Friend & { interestStatus: JobInterestStatus }

type FriendListProps = {
  jobId: string
  selectedFriendIds: string[]
  onSelectionChange: (friendIds: string[]) => void
}

export function FriendList({ jobId, selectedFriendIds, onSelectionChange }: FriendListProps) {
  const [friends, setFriends] = useState<FriendWithInterest[]>([])
  const userId = getCurrentUserId()

  useEffect(() => {
    const loadFriends = () => {
      const friendsWithInterest = getFriendsWithJobInterest(jobId, userId)
      setFriends(friendsWithInterest)
    }

    loadFriends()
    // 定期的に更新（他のタブで変更があった場合に備えて）
    const interval = setInterval(loadFriends, 2000)
    return () => clearInterval(interval)
  }, [jobId, userId])

  const handleToggleSelection = (friendId: string) => {
    if (selectedFriendIds.includes(friendId)) {
      onSelectionChange(selectedFriendIds.filter(id => id !== friendId))
    } else {
      onSelectionChange([...selectedFriendIds, friendId])
    }
  }


  const getInterestBadge = (status: JobInterestStatus) => {
    switch (status) {
      case 'interested':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
            <Heart size={12} className="mr-1 fill-current" />
            この求人に興味あり
          </Badge>
        )
      case 'not_interested':
        return (
          <Badge variant="outline" className="text-gray-600">
            興味なし
          </Badge>
        )
      default:
        return null
    }
  }

  if (friends.length === 0) {
    return (
      <div className="p-6 text-center border border-gray-200 rounded-lg bg-gray-50">
        <p className="text-gray-600 mb-2">友達リストが空です</p>
        <p className="text-sm text-gray-500">
          友達を追加してから、一緒に応募できるようになります
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {friends.map((friend) => {
        const isSelected = selectedFriendIds.includes(friend.id)
        
        return (
          <div
            key={friend.id}
            className={`
              flex items-center justify-between p-4 border rounded-lg transition-all
              ${isSelected 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 bg-white hover:border-gray-300'
              }
            `}
          >
            <div className="flex items-center gap-3 flex-1">
              <button
                type="button"
                onClick={() => handleToggleSelection(friend.id)}
                className={`
                  flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center
                  transition-colors
                  ${isSelected
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : 'border-gray-300 hover:border-blue-400'
                  }
                `}
              >
                {isSelected && <Check size={14} />}
              </button>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-gray-900 truncate">{friend.name}</p>
                  {getInterestBadge(friend.interestStatus)}
                </div>
                {friend.email && (
                  <p className="text-sm text-gray-500 truncate">{friend.email}</p>
                )}
                {friend.interestStatus === 'none' && (
                  <p className="text-xs text-gray-400 mt-1">
                    この求人への興味ステータス未設定
                  </p>
                )}
              </div>
            </div>

            {friend.interestStatus === 'interested' && (
              <div className="flex items-center gap-2 ml-4">
                <div className="text-sm text-green-600 font-medium">
                  この求人に興味あり
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

