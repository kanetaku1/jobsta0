'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, LogOut } from 'lucide-react'
import Link from 'next/link'
import { useLiff } from '@/lib/liff/liff-provider'
import { useToast } from '@/components/ui/use-toast'

interface UserProfile {
  id: string
  name: string
  displayName: string | null
  avatarUrl: string | null
  email: string | null
  role: string
  createdAt: string
}

export default function ProfilePage() {
  const router = useRouter()
  const liff = useLiff()
  const { toast } = useToast()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchProfile()
  }, [])
  
  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
      } else {
        toast({
          title: 'エラー',
          description: 'プロフィールの取得に失敗しました',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      toast({
        title: 'エラー',
        description: 'プロフィールの取得に失敗しました',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }
  
  const handleLogout = async () => {
    try {
      // セッションクリア（APIコール）
      await fetch('/api/auth/logout', { method: 'POST' })
      
      // クライアント側のクッキーも削除
      if (typeof window !== 'undefined') {
        document.cookie = 'auth0_id_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      }
      
      // LIFFログアウトは行わない（LINEのセッションは保持）
      // これにより、次回のログインがスムーズになる
      
      toast({
        title: 'ログアウトしました',
        description: 'またのご利用をお待ちしています',
      })
      
      // LIFF URLにリダイレクト（再ログイン用）
      const liffId = process.env.NEXT_PUBLIC_LIFF_ID
      if (liffId) {
        window.location.href = `https://liff.line.me/${liffId}`
      } else {
        router.push('/login')
      }
    } catch (error) {
      console.error('Logout error:', error)
      toast({
        title: 'エラー',
        description: 'ログアウトに失敗しました',
        variant: 'destructive',
      })
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    )
  }
  
  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-6 max-w-md w-full">
          <p className="text-gray-600 mb-4">プロフィールが見つかりません</p>
          <Button onClick={() => router.push('/login')} className="w-full">
            ログインページへ
          </Button>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              戻る
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">プロフィール</h1>
          <div className="w-20"></div>
        </div>
        
        {/* プロフィールカード */}
        <Card className="p-6 mb-6">
          <div className="flex items-start gap-6 mb-6">
            {/* アバター */}
            <div className="flex-shrink-0">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.displayName || profile.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-green-500"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                  <span className="text-white text-3xl font-bold">
                    {(profile.displayName || profile.name || '?').charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            
            {/* 基本情報 */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800 mb-1">
                {profile.displayName || profile.name}
              </h2>
              {profile.email && (
                <p className="text-gray-600 text-sm mb-3">{profile.email}</p>
              )}
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  profile.role === 'EMPLOYER' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {profile.role === 'EMPLOYER' ? '事業者' : '求職者'}
                </span>
                {profile.id.startsWith('line|') && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                    LINE連携済み
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* 詳細情報 */}
          <div className="border-t pt-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">ユーザーID</span>
              <span className="text-gray-800 font-mono text-xs">{profile.id}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">登録日</span>
              <span className="text-gray-800">
                {new Date(profile.createdAt).toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>
        </Card>
        
        {/* LINE連携情報 */}
        {profile.id.startsWith('line|') && (
          <Card className="p-6 mb-6 bg-green-50 border-green-200">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">L</span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 mb-1">LINE連携</h3>
                <p className="text-sm text-gray-600">
                  LINEアカウントと連携しています。LINE内でシームレスにJobstaを利用できます。
                </p>
              </div>
            </div>
          </Card>
        )}
        
        {/* アクションボタン */}
        <div className="space-y-3">
          <Button
            onClick={handleLogout}
            variant="destructive"
            className="w-full"
          >
            <LogOut className="mr-2 h-4 w-4" />
            ログアウト
          </Button>
        </div>
        
        {/* フッター情報 */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>Jobsta - 友達と応募できる短期バイトマッチングアプリ</p>
        </div>
      </div>
    </div>
  )
}
