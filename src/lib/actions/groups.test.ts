import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
  addMemberToGroup,
  createGroup,
  getGroup,
  updateGroupMemberApplicationStatus,
  updateGroupMemberStatus,
} from './groups';
import {
  createPrismaMock,
  mockRandomUUIDSequence,
  mockRequireAuth,
} from '../tests/test-helpers';
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
    id: 'owner-1',
    supabaseId: 'sb-owner-1',
  });
  return { requireAuth: requireAuthMock };
});

describe('groups actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.values(prismaMock.group).forEach((fn) => fn.mockReset());
    Object.values(prismaMock.groupMember).forEach((fn) => fn.mockReset());
    Object.values(prismaMock.job).forEach((fn) => fn.mockReset());
    requireAuthMock.mockResolvedValue({
      id: 'owner-1',
      supabaseId: 'sb-owner-1',
    });
  });

  it('creates group with members and revalidates cache', async () => {
    mockRandomUUIDSequence(['group-uuid', 'm1', 'm2']);
    const now = new Date();
    prismaMock.group.create.mockResolvedValue({
      id: 'group-uuid',
      ownerId: 'owner-1',
      ownerName: 'Owner',
      jobId: 'job-1',
      requiredCount: null,
      createdAt: now,
      updatedAt: now,
      members: [
        {
          id: 'm1',
          name: 'Alice',
          status: 'PENDING',
          applicationStatus: null,
          userId: 'alice-id',
          createdAt: now,
          updatedAt: now,
          groupId: 'group-uuid',
          email: null,
        },
        {
          id: 'm2',
          name: 'Bob',
          status: 'PENDING',
          applicationStatus: null,
          userId: 'bob-id',
          createdAt: now,
          updatedAt: now,
          groupId: 'group-uuid',
          email: null,
        },
      ],
    });

    const result = await createGroup(
      'job-1',
      'Owner',
      [
        { name: 'Alice', userId: 'alice-id' },
        { name: 'Bob', userId: 'bob-id' },
      ],
      2
    );

    expect(result?.id).toBe('group-uuid');
    expect(prismaMock.group.create).toHaveBeenCalled();
    expect(revalidateTag).toHaveBeenCalledWith('groups');
    expect(revalidateTag).toHaveBeenCalledWith('groups:owner-1');
  });

  it('addMemberToGroup adds new member and revalidates', async () => {
    prismaMock.group.findUnique.mockResolvedValue({ id: 'g1' });
    prismaMock.groupMember.findFirst.mockResolvedValue(null);
    prismaMock.groupMember.create.mockResolvedValue({
      id: 'gm-new',
      groupId: 'g1',
      name: 'New Member',
      userId: 'u-new',
      status: 'APPROVED',
    });

    const result = await addMemberToGroup('g1', 'New Member', 'u-new');

    expect(result).toEqual({ success: true, memberId: 'gm-new' });
    expect(revalidateTag).toHaveBeenCalledWith('groups');
    expect(revalidateTag).toHaveBeenCalledWith('group:g1');
  });

  it('addMemberToGroup returns false when member exists', async () => {
    prismaMock.group.findUnique.mockResolvedValue({ id: 'g1' });
    prismaMock.groupMember.findFirst.mockResolvedValue({ id: 'existing' });

    const result = await addMemberToGroup('g1', 'Dup Member', 'u-dup');

    expect(result).toEqual({ success: false });
    expect(prismaMock.groupMember.create).not.toHaveBeenCalled();
  });

  it('updateGroupMemberStatus only allows owner', async () => {
    prismaMock.group.findUnique.mockResolvedValue({ ownerId: 'another-user' });

    const ok = await updateGroupMemberStatus('g1', 'm1', 'approved');

    expect(ok).toBe(false);
    expect(prismaMock.groupMember.update).not.toHaveBeenCalled();
  });

  it('updateGroupMemberApplicationStatus enforces ownership and approval', async () => {
    // member not approved -> should fail
    prismaMock.groupMember.findUnique.mockResolvedValue({
      id: 'm1',
      groupId: 'g1',
      userId: 'member-1',
      status: 'PENDING',
      applicationStatus: 'PENDING',
    });
    requireAuthMock.mockResolvedValue({ id: 'member-1' });

    const fail = await updateGroupMemberApplicationStatus(
      'g1',
      'm1',
      'participating'
    );
    expect(fail).toBe(false);

    // approved member -> updates
    prismaMock.groupMember.findUnique.mockResolvedValue({
      id: 'm1',
      groupId: 'g1',
      userId: 'member-1',
      status: 'APPROVED',
      applicationStatus: 'PENDING',
    });
    prismaMock.groupMember.update.mockResolvedValue({
      id: 'm1',
    });

    const ok = await updateGroupMemberApplicationStatus(
      'g1',
      'm1',
      'participating'
    );
    expect(ok).toBe(true);
    expect(prismaMock.groupMember.update).toHaveBeenCalledWith({
      where: { id: 'm1' },
      data: { applicationStatus: 'PARTICIPATING' },
    });
    expect(revalidateTag).toHaveBeenCalledWith('groups');
    expect(revalidateTag).toHaveBeenCalledWith('groups:member-1');
    expect(revalidateTag).toHaveBeenCalledWith('group:g1');
  });

  it('getGroup returns transformed group data', async () => {
    const now = new Date();
    prismaMock.group.findUnique.mockResolvedValue({
      id: 'g1',
      jobId: 'job-1',
      ownerId: 'owner-1',
      ownerName: 'Owner',
      requiredCount: null,
      createdAt: now,
      updatedAt: now,
      members: [
        {
          id: 'm1',
          name: 'Alice',
          status: 'APPROVED',
          applicationStatus: 'PARTICIPATING',
          userId: 'alice-id',
          groupId: 'g1',
          createdAt: now,
          updatedAt: now,
          email: null,
          user: {
            id: 'alice-id',
            name: 'Alice',
            displayName: 'Alice',
          },
        },
      ],
    });

    const group = await getGroup('g1');

    expect(group?.id).toBe('g1');
    expect(group?.groupInviteLink).toContain('/invite/group/g1');
    expect(group?.members[0].status).toBe('approved');
    expect(group?.members[0].applicationStatus).toBe('participating');
  });
});
