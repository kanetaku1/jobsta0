'use client'

import { useState, useEffect, useCallback } from 'react'
import { Check, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Friend } from '@/types/application'
import { getFriends } from '@/lib/actions/friends'
import { clientCache, createCacheKey } from '@/lib/cache/client-cache'

type FriendListProps = {
  jobId: string
  selectedFriendIds: string[]
  onSelectionChange: (friendIds: string[]) => void
}

export function FriendList({ jobId, selectedFriendIds, onSelectionChange }: FriendListProps) {
  const [friends, setFriends] = useState<Friend[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const loadFriends = useCallback(async (useCache = true) => {
    const cacheKey = createCacheKey('friends', 'list')
    
    // キャッシュから取得を試みる
    if (useCache) {
      const cached = clientCache.get<Friend[]>(cacheKey)
      if (cached) {
        setFriends(cached)
        return
      }
    }

    setIsLoading(true)
    try {
      const friendsList = await getFriends()
      // キャッシュに保存（30秒TTL）
      clientCache.set(cacheKey, friendsList, 30000)
      setFriends(friendsList)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadFriends()
  }, []) // 初回のみ実行

  const handleToggleSelection = (friendId: string) => {
    if (selectedFriendIds.includes(friendId)) {
      onSelectionChange(selectedFriendIds.filter(id => id !== friendId))
    } else {
      onSelectionChange([...selectedFriendIds, friendId])
    }
  }



  if (friends.length === 0 && !isLoading) {
    return (
      <div className="p-6 text-center border border-gray-200 rounded-lg bg-gray-50">
        <p className="text-gray-600 mb-2">友達リストが空です</p>
        <p className="text-sm text-gray-500 mb-4">
          友達を追加してから、一緒に応募できるようになります
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => loadFriends(false)}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          更新
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-600">友達一覧</p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => loadFriends(false)}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          更新
        </Button>
      </div>
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
                </div>
                {friend.email && (
                  <p className="text-sm text-gray-500 truncate">{friend.email}</p>
                )}
              </div>
            </div>
          </div>
        )
      })}
      </div>
    </div>
  )
}

