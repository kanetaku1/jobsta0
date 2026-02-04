import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserRole } from '@prisma/client';

import { getCurrentUser, requireAuth } from './get-current-user';
import { createPrismaMock } from '../tests/test-helpers';

var prismaMock: ReturnType<typeof createPrismaMock>;
var cookiesMock: ReturnType<typeof vi.fn>;

vi.mock('@/lib/prisma/client', async () => {
  const { createPrismaMock } = await import('../tests/test-helpers');
  prismaMock = createPrismaMock();
  return { prisma: prismaMock };
});

vi.mock('./session-utils', () => ({
  getSessionTokenFromRequest: vi.fn(),
  getUserFromSessionToken: vi.fn(),
}));

vi.mock('next/headers', () => {
  cookiesMock = vi.fn();
  return { cookies: cookiesMock };
});

const sessionUtils = await import('./session-utils');

describe('get-current-user (LIFF compatible)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.values(prismaMock.user).forEach((fn) => fn.mockReset());
    cookiesMock.mockResolvedValue({
      get: vi.fn().mockReturnValue(undefined),
    });
  });

  it('returns null when no session token is provided', async () => {
    vi.mocked(sessionUtils.getSessionTokenFromRequest).mockReturnValue(null);
    vi.mocked(sessionUtils.getUserFromSessionToken).mockReturnValue(null);

    const user = await getCurrentUser();

    expect(user).toBeNull();
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  });

  it('returns user from db if found', async () => {
    vi.mocked(sessionUtils.getSessionTokenFromRequest).mockReturnValue('mock-token');
    vi.mocked(sessionUtils.getUserFromSessionToken).mockReturnValue({
      id: 'line|user-1',
      email: 'test@example.com',
      name: 'Test User',
      displayName: 'Test User',
      picture: 'http://example.com/pic.jpg',
      lineId: 'line|user-1',
    });

    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user-1',
      supabaseId: 'line|user-1',
      name: 'Test User',
      displayName: 'Test User',
      avatarUrl: 'http://example.com/pic.jpg',
      role: UserRole.JOB_SEEKER,
      email: 'test@example.com',
      lineId: 'line|user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const user = await getCurrentUser();

    expect(user).not.toBeNull();
    expect(user?.id).toBe('user-1');
    expect(user?.email).toBe('test@example.com');
  });

  it('returns null if user not found in db', async () => {
    vi.mocked(sessionUtils.getSessionTokenFromRequest).mockReturnValue('mock-token');
    vi.mocked(sessionUtils.getUserFromSessionToken).mockReturnValue({
      id: 'line|new-user',
      email: 'new@example.com',
      name: 'New User',
      displayName: 'New User',
      picture: null,
      lineId: 'line|new-user',
    });

    prismaMock.user.findUnique.mockResolvedValue(null);

    const user = await getCurrentUser();

    expect(user).toBeNull();
  });

  it('requireAuth throws if not authenticated', async () => {
    vi.mocked(sessionUtils.getSessionTokenFromRequest).mockReturnValue(null);

    await expect(requireAuth()).rejects.toThrow('認証が必要です。ログインしてください。');
  });

  it('requireAuth returns user if authenticated', async () => {
    vi.mocked(sessionUtils.getSessionTokenFromRequest).mockReturnValue('mock-token');
    vi.mocked(sessionUtils.getUserFromSessionToken).mockReturnValue({
      id: 'line|user-1',
      email: 'test@example.com',
      name: 'Test User',
      displayName: 'Test User',
      picture: null,
      lineId: 'line|user-1',
    });

    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user-1',
      supabaseId: 'line|user-1',
      name: 'Test User',
      displayName: 'Test User',
      avatarUrl: null,
      role: UserRole.JOB_SEEKER,
      email: 'test@example.com',
      lineId: 'line|user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const user = await requireAuth();

    expect(user).not.toBeNull();
    expect(user.id).toBe('user-1');
  });
});
