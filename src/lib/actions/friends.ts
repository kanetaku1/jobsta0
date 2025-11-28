'use server'

import { requireAuth } from '@/lib/auth/get-current-user'
import { prisma } from '@/lib/prisma/client'
import { unstable_cache } from 'next/cache'
import { CACHE_TAGS } from '@/lib/cache/server-cache'
import type { Friend } from '@/types/application'

/**
 * 現在のユーザーの友達一覧を取得（キャッシュ付き）
 */
export async function getFriends(): Promise<Friend[]> {
  try {
    const user = await requireAuth()
    
    // キャッシュキーをユーザーIDで生成
    const cacheKey = `friends:${user.id}`
    
    const getFriendsData = async () => {
      const friends = await prisma.friend.findMany({
        where: { userId: user.id },
        include: {
          friend: {
            select: {
              id: true,
              name: true,
              email: true,
              displayName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      return friends.map((f) => ({
        id: f.friendUserId || f.id,
        name: f.friend?.displayName || f.friend?.name || f.name,
        email: f.friend?.email || f.email || undefined,
      }))
    }

    return await unstable_cache(
      getFriendsData,
      [cacheKey],
      {
        revalidate: 30, // 30秒キャッシュ
        tags: [CACHE_TAGS.FRIENDS, `${CACHE_TAGS.FRIENDS}:${user.id}`],
      }
    )()
  } catch (error) {
    console.error('Error getting friends:', error)
    return []
  }
}

/**
 * 友達を追加
 */
export async function addFriend(friend: Omit<Friend, 'id'>): Promise<Friend | null> {
  try {
    const user = await requireAuth()

    // 既に友達として登録されているか確認
    const existingFriend = await prisma.friend.findFirst({
      where: {
        userId: user.id,
        OR: [
          { email: friend.email },
          { name: friend.name },
        ],
      },
    })

    if (existingFriend) {
      // 既に存在する場合は既存の友達情報を返す
      return {
        id: existingFriend.friendUserId || existingFriend.id,
        name: existingFriend.name,
        email: existingFriend.email || undefined,
      }
    }

    // メールアドレスで既存ユーザーを検索
    let friendUser = null
    if (friend.email) {
      friendUser = await prisma.user.findUnique({
        where: { email: friend.email },
      })
    }

    const newFriend = await prisma.friend.create({
      data: {
        userId: user.id,
        friendUserId: friendUser?.id,
        name: friend.name,
        email: friend.email,
      },
      include: {
        friend: {
          select: {
            id: true,
            name: true,
            email: true,
            displayName: true,
          },
        },
      },
    })

    // キャッシュを無効化
    const { revalidateTag } = await import('next/cache')
    revalidateTag(CACHE_TAGS.FRIENDS)
    revalidateTag(`${CACHE_TAGS.FRIENDS}:${user.id}`)

    return {
      id: newFriend.friendUserId || newFriend.id,
      name: newFriend.friend?.displayName || newFriend.friend?.name || newFriend.name,
      email: newFriend.friend?.email || newFriend.email || undefined,
    }
  } catch (error) {
    console.error('Error adding friend:', error)
    return null
  }
}

/**
 * 友達を削除
 */
export async function removeFriend(friendId: string): Promise<boolean> {
  try {
    const user = await requireAuth()

    // 友達を削除（userIdとfriendIdで検索）
    const result = await prisma.friend.deleteMany({
      where: {
        userId: user.id,
        OR: [
          { id: friendId },
          { friendUserId: friendId },
        ],
      },
    })

    // キャッシュを無効化
    if (result.count > 0) {
      const { revalidateTag } = await import('next/cache')
      revalidateTag(CACHE_TAGS.FRIENDS)
      revalidateTag(`${CACHE_TAGS.FRIENDS}:${user.id}`)
    }

    return result.count > 0
  } catch (error) {
    console.error('Error removing friend:', error)
    return false
  }
}

