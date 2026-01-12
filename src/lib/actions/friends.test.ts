import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
  addFriend,
  addFriendByUserId,
  getFriends,
} from './friends';
import { createPrismaMock, mockRequireAuth } from '../tests/test-helpers';
import { revalidateTag } from 'next/cache';

var prismaMock: ReturnType<typeof createPrismaMock>;
var requireAuthMock: ReturnType<typeof mockRequireAuth>;

vi.mock('@/lib/prisma/client', async () => {
  const { createPrismaMock } = await import('../tests/test-helpers');
  prismaMock = createPrismaMock();
  return { prisma: prismaMock };
});
vi.mock('@/lib/auth/get-current-user', async () => {
  const { mockRequireAuth } = await import('../tests/test-helpers');
  requireAuthMock = mockRequireAuth({
    id: 'user-1',
    supabaseId: 'supabase-user-1',
  });
  return { requireAuth: requireAuthMock };
});

describe('friends actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.values(prismaMock.friend).forEach((fn) => fn.mockReset());
    Object.values(prismaMock.user).forEach((fn) => fn.mockReset());
    requireAuthMock.mockResolvedValue({
      id: 'user-1',
      supabaseId: 'supabase-user-1',
    });
  });

  it('getFriends returns mapped friend list', async () => {
    prismaMock.friend.findMany.mockResolvedValue([
      {
        id: 'f1',
        name: 'Local Name',
        email: 'f@example.com',
        friendUserId: 'friend-1',
        userId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        friend: {
          id: 'friend-1',
          name: 'Friend Name',
          displayName: 'Display Friend',
          email: 'f@example.com',
        },
      },
    ]);

    const result = await getFriends();

    expect(result).toEqual([
      {
        id: 'f1',
        name: 'Display Friend',
        email: 'f@example.com',
        userId: 'friend-1',
      },
    ]);
  });

  it('addFriend returns existing friend without creating duplicates', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.friend.findFirst.mockResolvedValue({
      id: 'existing-id',
      friendUserId: 'friend-2',
      name: 'Existing Friend',
      email: 'ex@example.com',
    });

    const result = await addFriend({ name: 'Existing Friend', email: 'ex@example.com' });

    expect(result).toEqual({
      id: 'friend-2',
      name: 'Existing Friend',
      email: 'ex@example.com',
    });
    expect(prismaMock.friend.create).not.toHaveBeenCalled();
  });

  it('addFriend creates friend and revalidates cache', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'friend-user',
      email: 'new@example.com',
      name: 'New User',
      displayName: 'New Display',
    });
    prismaMock.friend.findFirst.mockResolvedValue(null);
    prismaMock.friend.create.mockResolvedValue({
      id: 'record-1',
      friendUserId: 'friend-user',
      name: 'New Display',
      email: 'new@example.com',
      userId: 'user-1',
    });

    const result = await addFriend({ name: 'fallback', email: 'new@example.com' });

    expect(prismaMock.friend.create).toHaveBeenCalled();
    expect(result).toEqual({
      id: 'friend-user',
      name: 'New Display',
      email: 'new@example.com',
    });
    expect(revalidateTag).toHaveBeenCalledWith('friends');
    expect(revalidateTag).toHaveBeenCalledWith('friends:user-1');
  });

  it('addFriendByUserId links inviter and invitee both ways', async () => {
    // invited user (current)
    requireAuthMock.mockResolvedValue({
      id: 'invited-user',
      supabaseId: 'invitee-sb',
      email: 'invitee@example.com',
      name: 'Invitee',
      displayName: 'Invitee',
    });

    // inviter lookup by supabaseId
    prismaMock.user.findUnique
      .mockResolvedValueOnce({
        id: 'inviter-user',
        supabaseId: 'inviter-sb',
        email: 'inviter@example.com',
        name: 'Inviter',
        displayName: 'Inviter',
      });

    // existing friend checks
    prismaMock.friend.findFirst
      .mockResolvedValueOnce(null) // invitedUser list check
      .mockResolvedValueOnce(null); // inviter list check

    prismaMock.friend.create
      .mockResolvedValueOnce({
        id: 'f-invitee',
        friendUserId: 'inviter-user',
        name: 'Inviter',
        email: 'inviter@example.com',
        userId: 'invited-user',
      })
      .mockResolvedValueOnce({
        id: 'f-inviter',
        friendUserId: 'invited-user',
        name: 'Invitee',
        email: 'invitee@example.com',
        userId: 'inviter-user',
      });

    const result = await addFriendByUserId('inviter-sb');

    expect(result).toEqual({
      id: 'inviter-user',
      name: 'Inviter',
      email: 'inviter@example.com',
    });
    expect(prismaMock.friend.create).toHaveBeenCalledTimes(2);
    expect(revalidateTag).toHaveBeenCalledWith('friends');
    expect(revalidateTag).toHaveBeenCalledWith('friends:invited-user');
    expect(revalidateTag).toHaveBeenCalledWith('friends:inviter-user');
  });
});
