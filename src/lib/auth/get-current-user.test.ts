import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserRole } from '@prisma/client';

import { getCurrentUser, requireAuth } from './get-current-user';
import { createPrismaMock } from '../tests/test-helpers';
import { revalidateTag } from 'next/cache';

var prismaMock: ReturnType<typeof createPrismaMock>;
var cookiesMock: ReturnType<typeof vi.fn>;

vi.mock('@/lib/prisma/client', async () => {
  const { createPrismaMock } = await import('../tests/test-helpers');
  prismaMock = createPrismaMock();
  return { prisma: prismaMock };
});

vi.mock('./auth0-utils', () => ({
  getAuth0IdTokenFromRequest: vi.fn(),
  getUserFromAuth0Token: vi.fn(),
}));

vi.mock('./sync-user', () => ({
  syncUserFromAuth0: vi.fn(),
}));

vi.mock('next/headers', () => {
  cookiesMock = vi.fn();
  return { cookies: cookiesMock };
});

const auth0Utils = await import('./auth0-utils');
const syncUserModule = await import('./sync-user');

describe('get-current-user (LINE/Login compatible)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.values(prismaMock.user).forEach((fn) => fn.mockReset());
    cookiesMock.mockResolvedValue({
      get: vi.fn().mockReturnValue(undefined),
    });
  });

  it('returns null when no id token is provided', async () => {
    vi.mocked(auth0Utils.getAuth0IdTokenFromRequest).mockReturnValue(null);
    vi.mocked(auth0Utils.getUserFromAuth0Token).mockReturnValue(null);

    const user = await getCurrentUser();

    expect(user).toBeNull();
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  });

  it('returns existing user when token is valid and user exists', async () => {
    cookiesMock.mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: 'token-1' }),
    });
    vi.mocked(auth0Utils.getAuth0IdTokenFromRequest).mockReturnValue('token-1');
    vi.mocked(auth0Utils.getUserFromAuth0Token).mockReturnValue({
      id: 'line-123',
      email: 'a@example.com',
      name: 'line user',
      displayName: 'line user',
      picture: null,
      lineId: 'line-123',
    });
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'u1',
      supabaseId: 'line-123',
      email: 'a@example.com',
      name: 'line user',
      displayName: 'line user',
      role: UserRole.JOB_SEEKER,
      lineId: null,
      avatarUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const user = await getCurrentUser();

    expect(user?.id).toBe('u1');
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { supabaseId: 'line-123' },
    });
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it('creates user via sync when not found', async () => {
    cookiesMock.mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: 'token-2' }),
    });
    vi.mocked(auth0Utils.getAuth0IdTokenFromRequest).mockReturnValue('token-2');
    vi.mocked(auth0Utils.getUserFromAuth0Token).mockReturnValue({
      id: 'line-234',
      email: 'b@example.com',
      name: 'b user',
      displayName: 'b user',
      picture: null,
      lineId: 'line-234',
    });
    prismaMock.user.findUnique.mockResolvedValue(null);
    vi.mocked(syncUserModule.syncUserFromAuth0).mockResolvedValue({
      id: 'new-user',
      supabaseId: 'line-234',
      email: 'b@example.com',
      name: 'b user',
      displayName: 'b user',
      role: UserRole.JOB_SEEKER,
      lineId: null,
      avatarUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const user = await getCurrentUser();

    expect(syncUserModule.syncUserFromAuth0).toHaveBeenCalledWith('token-2');
    expect(user?.id).toBe('new-user');
    expect(revalidateTag).toHaveBeenCalledWith('user');
    expect(revalidateTag).toHaveBeenCalledWith('user:line-234');
  });

  it('requireAuth throws when unauthenticated', async () => {
    vi.mocked(auth0Utils.getAuth0IdTokenFromRequest).mockReturnValue(null);
    await expect(requireAuth()).rejects.toThrow('認証が必要です。ログインしてください。');
  });
});
