'use server'

import { requireAuth } from '@/lib/auth/get-current-user'
import { prisma } from '@/lib/prisma/client'
import { unstable_cache } from 'next/cache'
import { CACHE_TAGS } from '@/lib/cache/server-cache'
import type { Friend } from '@/types/application'
import { handleServerActionError, handleDataFetchError, handleError } from '@/lib/utils/error-handler'

/**
 * supabaseIdからユーザー情報を取得
 */
export async function getUserBySupabaseId(supabaseId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { supabaseId },
      select: {
        id: true,
        name: true,
        email: true,
        displayName: true,
        supabaseId: true,
      },
    })

    return user
  } catch (error) {
    console.error('Error getting user by supabaseId:', error)
    return null
  }
}

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
        id: f.id,
        name: f.friend?.displayName || f.friend?.name || f.name,
        email: f.friend?.email || f.email || undefined,
        userId: f.friendUserId || undefined, // UserテーブルのID
      }))
    }

    return await unstable_cache(
      getFriendsData,
      [cacheKey],
      {
        revalidate: 60, // 60秒キャッシュ
        tags: [CACHE_TAGS.FRIENDS, `${CACHE_TAGS.FRIENDS}:${user.id}`],
      }
    )()
  } catch (error) {
    return handleDataFetchError(error, {
      context: 'friend',
      operation: 'getFriends',
      defaultErrorMessage: '友達一覧の取得に失敗しました',
    }, [])
  }
}

/**
 * 友達を追加
 * @param friend 友達情報（name, email）
 * @param friendUserId 友達のユーザーID（オプション、直接指定する場合）
 */
export async function addFriend(
  friend: Omit<Friend, 'id'>,
  friendUserId?: string
): Promise<Friend | null> {
  try {
    const user = await requireAuth()

    // friendUserIdが指定されている場合、そのユーザーを検索
    let friendUser = null
    if (friendUserId) {
      friendUser = await prisma.user.findUnique({
        where: { id: friendUserId },
      })
      if (!friendUser) {
        return handleDataFetchError(
          new Error('指定されたユーザーが見つかりません'),
          {
            context: 'friend',
            operation: 'addFriend',
            defaultErrorMessage: '友達の追加に失敗しました',
          },
          null
        )
      }
    } else if (friend.email) {
      // メールアドレスで既存ユーザーを検索
      friendUser = await prisma.user.findUnique({
        where: { email: friend.email },
      })
    }

    // 既に友達として登録されているか確認
    const existingFriend = await prisma.friend.findFirst({
      where: {
        userId: user.id,
        OR: [
          { friendUserId: friendUser?.id },
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

    // 友達の名前を決定（friendUserが存在する場合はその表示名を使用）
    const friendName = friendUser
      ? friendUser.displayName || friendUser.name || friend.name
      : friend.name

    // 友達のメールアドレスを決定
    const friendEmail = friendUser?.email || friend.email

    const newFriend = await prisma.friend.create({
      data: {
        userId: user.id,
        friendUserId: friendUser?.id,
        name: friendName,
        email: friendEmail,
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
      name: newFriend.name,
      email: newFriend.email || undefined,
    }
  } catch (error) {
    return handleDataFetchError(error, {
      context: 'friend',
      operation: 'addFriend',
      defaultErrorMessage: '友達の追加に失敗しました',
    }, null)
  }
}

/**
 * supabaseIdを指定して双方向の友達関係を作成
 * @param inviterSupabaseId 招待者のsupabaseId
 */
export async function addFriendByUserId(
  inviterSupabaseId: string
): Promise<Friend | null> {
  try {
    const invitedUser = await requireAuth()

    // 招待者のユーザー情報を取得
    const inviterUser = await getUserBySupabaseId(inviterSupabaseId)
    if (!inviterUser) {
      return handleDataFetchError(
        new Error('招待者のユーザー情報が見つかりません'),
        {
          context: 'friend',
          operation: 'addFriendByUserId',
          defaultErrorMessage: '友達の追加に失敗しました',
        },
        null
      )
    }

    // 自分自身を追加しようとしている場合はエラー
    if (invitedUser.supabaseId === inviterSupabaseId) {
      return handleDataFetchError(
        new Error('自分自身を友達に追加することはできません'),
        {
          context: 'friend',
          operation: 'addFriendByUserId',
          defaultErrorMessage: '友達の追加に失敗しました',
        },
        null
      )
    }

    // 既に友達関係が存在するか確認（被招待者→招待者）
    const existingFriend1 = await prisma.friend.findFirst({
      where: {
        userId: invitedUser.id,
        friendUserId: inviterUser.id,
      },
    })

    if (existingFriend1) {
      // 既に存在する場合は既存の友達情報を返す
      return {
        id: existingFriend1.friendUserId || existingFriend1.id,
        name: existingFriend1.name,
        email: existingFriend1.email || undefined,
      }
    }

    // 被招待者の友達リストに招待者を追加
    const friendName1 = '友達' + inviterUser.id
    const newFriend1 = await prisma.friend.create({
      data: {
        userId: invitedUser.id,
        friendUserId: inviterUser.id,
        name: friendName1,
        email: inviterUser.email,
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

    // 招待者の友達リストに被招待者を追加（既に存在しない場合のみ）
    const existingFriend2 = await prisma.friend.findFirst({
      where: {
        userId: inviterUser.id,
        friendUserId: invitedUser.id,
      },
    })

    if (!existingFriend2) {
      const friendName2 = '友達' + invitedUser.id
      await prisma.friend.create({
        data: {
          userId: inviterUser.id,
          friendUserId: invitedUser.id,
          name: friendName2,
          email: invitedUser.email,
        },
      })
    }

    // キャッシュを無効化（両方のユーザー）
    const { revalidateTag } = await import('next/cache')
    revalidateTag(CACHE_TAGS.FRIENDS)
    revalidateTag(`${CACHE_TAGS.FRIENDS}:${invitedUser.id}`)
    revalidateTag(`${CACHE_TAGS.FRIENDS}:${inviterUser.id}`)

    return {
      id: newFriend1.friendUserId || newFriend1.id,
      name: newFriend1.name,
      email: newFriend1.email || undefined,
    }
  } catch (error) {
    return handleDataFetchError(error, {
      context: 'friend',
      operation: 'addFriendByUserId',
      defaultErrorMessage: '友達の追加に失敗しました',
    }, null)
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
    handleError(error, {
      context: 'friend',
      operation: 'removeFriend',
      defaultErrorMessage: '友達の削除に失敗しました',
    })
    return false
  }
}

