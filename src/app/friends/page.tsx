'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, UserPlus, Edit, Trash2, Copy, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { QRCodeSVG } from 'qrcode.react'
import { getFriends, addFriend, removeFriend } from '@/lib/actions/friends'
import { getCurrentUserFromAuth0 } from '@/lib/auth/auth0-utils'
import type { Friend } from '@/types/application'

export default function FriendsPage() {
  const { toast } = useToast()
  const [friends, setFriends] = useState<Friend[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingFriend, setEditingFriend] = useState<Friend | null>(null)
  const [newFriendName, setNewFriendName] = useState('')
  const [newFriendEmail, setNewFriendEmail] = useState('')
  const [copiedLink, setCopiedLink] = useState(false)
  const [showQRCode, setShowQRCode] = useState(false)

  const loadFriends = async () => {
    // クライアント側キャッシュを確認
    const { clientCache, createCacheKey } = await import('@/lib/cache/client-cache')
    const cacheKey = createCacheKey('friends')
    const cached = clientCache.get<Friend[]>(cacheKey)
    
    if (cached) {
      setFriends(cached)
      return
    }
    
    const friendsList = await getFriends()
    setFriends(friendsList)
    
    // キャッシュに保存（30秒TTL）
    clientCache.set(cacheKey, friendsList, 30000)
  }

  useEffect(() => {
    loadFriends()
  }, []) // 初回のみ実行

  // 友達追加モーダルは招待リンクとQRコードを表示するだけ
  // 名前入力は不要

  const handleEditFriend = (friend: Friend) => {
    setEditingFriend(friend)
    setNewFriendName(friend.name)
    setNewFriendEmail(friend.email || '')
    setIsAddModalOpen(true)
  }

  const handleUpdateFriend = async () => {
    if (!editingFriend || !newFriendName.trim()) {
      toast({
        title: 'エラー',
        description: '友達の名前を入力してください',
        variant: 'destructive',
      })
      return
    }

    // 友達情報の更新は、削除して再追加で実現
    await removeFriend(editingFriend.id)
    const result = await addFriend({
      name: newFriendName.trim(),
      email: newFriendEmail.trim() || undefined,
    })
    
    if (result) {
      // キャッシュを無効化
      const { clientCache, createCacheKey } = await import('@/lib/cache/client-cache')
      const cacheKey = createCacheKey('friends')
      clientCache.delete(cacheKey)
      
      await loadFriends()
      setEditingFriend(null)
      setNewFriendName('')
      setNewFriendEmail('')
      setIsAddModalOpen(false)
      
      toast({
        title: '友達情報を更新しました',
      })
    } else {
      toast({
        title: 'エラー',
        description: '友達情報の更新に失敗しました',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteFriend = async (friendId: string) => {
    if (confirm('この友達を削除しますか？')) {
      const success = await removeFriend(friendId)
      if (success) {
        // キャッシュを無効化
        const { clientCache, createCacheKey } = await import('@/lib/cache/client-cache')
        const cacheKey = createCacheKey('friends')
        clientCache.delete(cacheKey)
        
        await loadFriends()
        toast({
          title: '友達を削除しました',
        })
      } else {
        toast({
          title: 'エラー',
          description: '友達の削除に失敗しました',
          variant: 'destructive',
        })
      }
    }
  }

  const handleCopyLink = () => {
    const user = getCurrentUserFromAuth0()
    if (!user) {
      toast({
        title: 'エラー',
        description: 'ログインが必要です',
        variant: 'destructive',
      })
      return
    }
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
    const inviteLink = `${baseUrl}/friends/invite?from=${user.id}`
    navigator.clipboard.writeText(inviteLink)
    setCopiedLink(true)
    toast({
      title: 'コピーしました',
      description: '招待リンクをクリップボードにコピーしました',
    })
    setTimeout(() => {
      setCopiedLink(false)
    }, 2000)
  }


  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft size={20} />
          ホームに戻る
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800">友達リスト</h1>
            <Button
              onClick={() => {
                setShowQRCode(true)
              }}
              className="flex items-center gap-2"
            >
              <UserPlus size={18} />
              友達を招待
            </Button>
          </div>

          {friends.length === 0 ? (
            <div className="text-center py-12 border border-gray-200 rounded-lg bg-gray-50">
              <p className="text-gray-600 mb-4">友達リストが空です</p>
              <p className="text-sm text-gray-500 mb-4">
                招待リンクを友達に送って、友達リストに追加してもらえます
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">友達一覧</h2>
              {friends.map((friend) => (
                <div
                  key={friend.id}
                  className="p-4 border border-gray-200 rounded-lg bg-gray-50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-lg">{friend.name}</p>
                      {friend.email && (
                        <p className="text-sm text-gray-500 mt-1">{friend.email}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditFriend(friend)}
                        className="flex items-center gap-1"
                      >
                        <Edit size={14} />
                        編集
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteFriend(friend.id)}
                        className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 size={14} />
                        削除
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 友達編集モーダル */}
      {isAddModalOpen && editingFriend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md m-4">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">友達を編集</h2>
              <button
                onClick={() => {
                  setIsAddModalOpen(false)
                  setEditingFriend(null)
                  setNewFriendName('')
                  setNewFriendEmail('')
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleUpdateFriend()
              }}
              className="p-6 space-y-4"
            >
              <div>
                <Label htmlFor="friendName">
                  名前 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="friendName"
                  type="text"
                  value={newFriendName}
                  onChange={(e) => setNewFriendName(e.target.value)}
                  placeholder="友達の名前"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="friendEmail">メールアドレス</Label>
                <Input
                  id="friendEmail"
                  type="email"
                  value={newFriendEmail}
                  onChange={(e) => setNewFriendEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="mt-1"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddModalOpen(false)
                    setEditingFriend(null)
                    setNewFriendName('')
                    setNewFriendEmail('')
                  }}
                  className="flex-1"
                >
                  キャンセル
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                >
                  更新
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QRコード表示モーダル */}
      {showQRCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md m-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">友達を招待</h2>
              <button
                onClick={() => setShowQRCode(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                このリンクまたはQRコードを友達に送って、友達リストに追加してもらえます。
              </p>
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  readOnly
                  value={(() => {
                    const user = getCurrentUserFromAuth0()
                    if (!user) return ''
                    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
                    return `${baseUrl}/friends/invite?from=${user.id}`
                  })()}
                  className="flex-1 text-sm"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyLink}
                  className="flex items-center gap-2"
                >
                  {copiedLink ? (
                    <>
                      <Check size={14} />
                      コピー済み
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      コピー
                    </>
                  )}
                </Button>
              </div>

              <div className="flex items-center justify-center p-4 bg-gray-50 rounded border border-gray-200">
                <QRCodeSVG 
                  value={(() => {
                    const user = getCurrentUserFromAuth0()
                    if (!user) return ''
                    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
                    return `${baseUrl}/friends/invite?from=${user.id}`
                  })()} 
                  size={200} 
                />
              </div>
              <p className="text-xs text-gray-500 text-center">
                QRコードをスキャンして友達を追加
              </p>

              <Button
                onClick={() => setShowQRCode(false)}
                className="w-full"
              >
                閉じる
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

