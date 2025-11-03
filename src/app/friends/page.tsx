'use client'

import { useState, useEffect } from 'react'
import { UserPlus, Trash2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import type { Friend } from '@/types/application'
import { getFriends, addFriend, removeFriend } from '@/lib/localStorage'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'

export default function FriendsPage() {
    const [friends, setFriends] = useState<Friend[]>([])
    const [showAddForm, setShowAddForm] = useState(false)
    const [newFriendName, setNewFriendName] = useState('')
    const [newFriendEmail, setNewFriendEmail] = useState('')
    const { toast } = useToast()

    useEffect(() => {
        loadFriends()
    }, [])

    const loadFriends = () => {
        const friendsList = getFriends()
        setFriends(friendsList)
    }

    const handleAddFriend = (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!newFriendName.trim()) {
            toast({
                title: 'エラー',
                description: '名前を入力してください',
                variant: 'destructive',
            })
            return
        }

        const newFriend: Friend = {
            id: `friend_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: newFriendName.trim(),
            email: newFriendEmail.trim() || undefined,
        }

        addFriend(newFriend)
        loadFriends()
        setNewFriendName('')
        setNewFriendEmail('')
        setShowAddForm(false)
        
        toast({
            title: '友達を追加しました',
            description: `${newFriend.name}を友達リストに追加しました`,
        })
    }

    const handleRemoveFriend = (friendId: string, friendName: string) => {
        if (confirm(`${friendName}を友達リストから削除しますか？`)) {
            removeFriend(friendId)
            loadFriends()
            
            toast({
                title: '友達を削除しました',
                description: `${friendName}を友達リストから削除しました`,
            })
        }
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
                        <h1 className="text-3xl font-bold text-gray-800">
                            友達リスト
                        </h1>
                        <Button
                            onClick={() => setShowAddForm(!showAddForm)}
                            className="flex items-center gap-2"
                        >
                            <UserPlus size={20} />
                            友達を追加
                        </Button>
                    </div>

                    {showAddForm && (
                        <form onSubmit={handleAddFriend} className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="friendName">
                                        名前 <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="friendName"
                                        type="text"
                                        value={newFriendName}
                                        onChange={(e) => setNewFriendName(e.target.value)}
                                        placeholder="山田太郎"
                                        required
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="friendEmail">
                                        メールアドレス（任意）
                                    </Label>
                                    <Input
                                        id="friendEmail"
                                        type="email"
                                        value={newFriendEmail}
                                        onChange={(e) => setNewFriendEmail(e.target.value)}
                                        placeholder="example@email.com"
                                        className="mt-1"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button type="submit">
                                        追加
                                    </Button>
                                    <Button 
                                        type="button" 
                                        variant="outline"
                                        onClick={() => {
                                            setShowAddForm(false)
                                            setNewFriendName('')
                                            setNewFriendEmail('')
                                        }}
                                    >
                                        キャンセル
                                    </Button>
                                </div>
                            </div>
                        </form>
                    )}

                    {friends.length === 0 ? (
                        <div className="text-center py-12">
                            <UserPlus size={64} className="mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-600 mb-2">まだ友達がいません</p>
                            <p className="text-sm text-gray-500 mb-4">
                                友達を追加すると、一緒に応募できるようになります
                            </p>
                            <Button
                                onClick={() => setShowAddForm(true)}
                                className="flex items-center gap-2"
                            >
                                <UserPlus size={20} />
                                最初の友達を追加
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {friends.map((friend) => (
                                <div
                                    key={friend.id}
                                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white hover:border-gray-300 transition-colors"
                                >
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">{friend.name}</p>
                                        {friend.email && (
                                            <p className="text-sm text-gray-500 mt-1">{friend.email}</p>
                                        )}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleRemoveFriend(friend.id, friend.name)}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                        <Trash2 size={18} />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

