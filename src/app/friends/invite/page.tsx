'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, ArrowLeft, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { 
  getFriends,
  addFriend,
  getCurrentUserId,
  getCurrentUserName
} from '@/lib/localStorage'
import { getCurrentUserFromAuth0 } from '@/lib/auth/auth0-utils'
import type { Friend } from '@/types/application'

export default function FriendInvitePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [fromUserId, setFromUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [added, setAdded] = useState(false)
  const [inviterName, setInviterName] = useState<string>('')

  useEffect(() => {
    const loadData = async () => {
      // URLパラメータからfromUserIdを取得
      const fromId = searchParams.get('from')
      if (!fromId) {
        setLoading(false)
        return
      }

      setFromUserId(fromId)

      // ログイン状態を確認
      const currentUserId = getCurrentUserId()
      if (!currentUserId) {
        // ログインしていない場合は、招待トークンをlocalStorageに保存してログインページにリダイレクト
        localStorage.setItem('jobsta_friend_invite_token', fromId)
        router.push('/login?redirect=/friends/invite?from=' + encodeURIComponent(fromId))
        return
      }

      // 既に友達リストに追加されているか確認
      const friends = getFriends()
      const existingFriend = friends.find(f => f.id === fromId)
      
      if (existingFriend) {
        setAdded(true)
        setInviterName(existingFriend.name)
        setLoading(false)
        return
      }

      // 招待者の情報を取得（名前を取得する方法を実装）
      // 現在はユーザーIDから名前を取得できないため、デフォルト名を使用
      const inviterDisplayName = '友達'
      
      // 相互追加：招待者と被招待者の両方の友達リストに追加
      const currentUser = getCurrentUserFromAuth0()
      const currentUserName = currentUser?.displayName || getCurrentUserName() || 'ユーザー'
      
      // 被招待者の友達リストに招待者を追加
      const inviterFriend: Friend = {
        id: fromId,
        name: inviterDisplayName,
        email: undefined,
      }
      addFriend(inviterFriend)
      
      // 招待者の友達リストに被招待者を追加（localStorageはクライアント側のみなので、実際には招待者の環境では実行できない）
      // この部分は将来的にサーバーサイドで実装する必要がある
      
      setAdded(true)
      setInviterName(inviterDisplayName)
      
      toast({
        title: '友達を追加しました',
        description: `${inviterDisplayName}さんを友達リストに追加しました。`,
      })

      setLoading(false)
    }

    loadData()
  }, [searchParams, router, toast])

  // 招待トークンがlocalStorageに保存されている場合、ログイン後に自動追加
  useEffect(() => {
    const inviteToken = localStorage.getItem('jobsta_friend_invite_token')
    if (inviteToken && getCurrentUserId()) {
      const friends = getFriends()
      const existingFriend = friends.find(f => f.id === inviteToken)
      
      if (!existingFriend) {
        const inviterFriend: Friend = {
          id: inviteToken,
          name: '友達',
          email: undefined,
        }
        addFriend(inviterFriend)
        
        toast({
          title: '友達を追加しました',
          description: '友達リストに追加されました。',
        })
      }
      
      localStorage.removeItem('jobsta_friend_invite_token')
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    )
  }

  if (!fromUserId) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
              友達招待
            </h1>
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">招待リンクが無効です</p>
              <Link href="/friends" className="text-blue-600 hover:text-blue-800">
                友達リストに戻る
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Link 
          href="/friends"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft size={20} />
          友達リストに戻る
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            友達招待
          </h1>

          {added && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="text-green-600" size={20} />
                  <p className="text-green-800 font-semibold">
                    友達リストに追加されました
                  </p>
                </div>
                <p className="text-green-700 text-sm">
                  {inviterName}さんを友達リストに追加しました。
                </p>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <Link href="/friends">
                  <Button className="w-full bg-blue-600 text-white hover:bg-blue-700">
                    友達リストを確認する
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {!added && (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">友達リストに追加できませんでした</p>
              <Link href="/friends" className="text-blue-600 hover:text-blue-800">
                友達リストに戻る
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

