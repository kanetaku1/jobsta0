import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
  createApplication,
  getApplications,
  updateApplicationStatus,
  getJobApplicantsForUser,
} from './applications';
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
    id: 'applicant-1',
    supabaseId: 'sb-applicant-1',
  });
  return { requireAuth: requireAuthMock };
});

describe('applications actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.values(prismaMock.application).forEach((fn) => fn.mockReset());
    Object.values(prismaMock.group).forEach((fn) => fn.mockReset());
    Object.values(prismaMock.groupMember).forEach((fn) => fn.mockReset());
    Object.values(prismaMock.job).forEach((fn) => fn.mockReset());
    requireAuthMock.mockResolvedValue({
      id: 'applicant-1',
      supabaseId: 'sb-applicant-1',
    });
  });

  it('creates application without group (individual)', async () => {
    prismaMock.job.findUnique.mockResolvedValue({ id: 'job-1' });
    mockRandomUUIDSequence(['app-uuid']);
    const now = new Date();
    prismaMock.application.create.mockResolvedValue({
      id: 'app-uuid',
      jobId: 'job-1',
      groupId: null,
      applicantId: 'applicant-1',
      status: 'PENDING',
      createdAt: now,
      updatedAt: now,
      group: null,
    });

    const app = await createApplication('job-1', [], undefined);

    expect(app).toMatchObject({
      id: 'app-uuid',
      jobId: 'job-1',
      groupId: undefined,
      applicantUserId: 'applicant-1',
      friendUserIds: [],
      status: 'pending',
    });
    expect(prismaMock.group.create).not.toHaveBeenCalled();
    expect(revalidateTag).toHaveBeenCalledWith('applications');
    expect(revalidateTag).toHaveBeenCalledWith('applications:applicant-1');
  });

  it('creates application with friends by creating group', async () => {
    prismaMock.job.findUnique.mockResolvedValue({ id: 'job-1' });
    mockRandomUUIDSequence(['group-uuid', 'gm1', 'gm2', 'app-uuid']);
    const now = new Date();
    prismaMock.group.create.mockResolvedValue({
      id: 'group-uuid',
      ownerId: 'applicant-1',
      ownerName: 'Owner',
      jobId: 'job-1',
      requiredCount: null,
      createdAt: now,
      updatedAt: now,
      members: [
        {
          id: 'gm1',
          name: '',
          status: 'PENDING',
          applicationStatus: null,
          userId: 'friend-1',
          groupId: 'group-uuid',
          createdAt: now,
          updatedAt: now,
          email: null,
        },
        {
          id: 'gm2',
          name: '',
          status: 'PENDING',
          applicationStatus: null,
          userId: 'friend-2',
          groupId: 'group-uuid',
          createdAt: now,
          updatedAt: now,
          email: null,
        },
      ],
    });
    prismaMock.application.create.mockResolvedValue({
      id: 'app-uuid',
      jobId: 'job-1',
      groupId: 'group-uuid',
      applicantId: 'applicant-1',
      status: 'PENDING',
      createdAt: now,
      updatedAt: now,
      group: {
        members: [
          { id: 'gm1', userId: 'friend-1' },
          { id: 'gm2', userId: 'friend-2' },
        ],
      },
    });

    const app = await createApplication('job-1', ['friend-1', 'friend-2']);

    expect(prismaMock.group.create).toHaveBeenCalled();
    expect(app?.groupId).toBe('group-uuid');
    expect(app?.friendUserIds).toEqual(['friend-1', 'friend-2']);
    expect(revalidateTag).toHaveBeenCalledWith('groups');
    expect(revalidateTag).toHaveBeenCalledWith('group:group-uuid');
  });

  it('getApplications maps data correctly', async () => {
    const now = new Date();
    prismaMock.application.findMany.mockResolvedValue([
      {
        id: 'app-1',
        jobId: 'job-1',
        applicantId: 'applicant-1',
        status: 'APPROVED',
        createdAt: now,
        updatedAt: now,
        groupId: 'group-1',
        job: { id: 'job-1', title: 'Job' },
        group: {
          members: [
            { id: 'gm1', userId: 'applicant-1' },
            { id: 'gm2', userId: 'friend-1' },
          ],
        },
      },
    ]);

    const apps = await getApplications();

    expect(apps[0]).toMatchObject({
      id: 'app-1',
      jobId: 'job-1',
      applicantUserId: 'applicant-1',
      friendUserIds: ['friend-1'],
      status: 'approved',
    });
  });

  it('updateApplicationStatus enforces ownership', async () => {
    prismaMock.application.findUnique.mockResolvedValue({
      applicantId: 'applicant-1',
    });

    const ok = await updateApplicationStatus('app-1', 'approved');

    expect(ok).toBe(true);
    expect(prismaMock.application.update).toHaveBeenCalledWith({
      where: { id: 'app-1' },
      data: { status: 'APPROVED' },
    });
    expect(revalidateTag).toHaveBeenCalledWith('applications');
    expect(revalidateTag).toHaveBeenCalledWith('applications:applicant-1');
  });

  it('getJobApplicantsForUser returns friend-aware view', async () => {
    prismaMock.friend.findMany.mockResolvedValue([
      { friendUserId: 'friend-1' },
    ]);

    prismaMock.application.findMany.mockResolvedValue([
      {
        id: 'app-1',
        jobId: 'job-1',
        applicantId: 'applicant-1', // self
        status: 'PENDING',
        groupId: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        applicant: {
          id: 'applicant-1',
          name: 'Self User',
          displayName: 'Self Display',
          avatarUrl: 'self.png',
        },
      },
      {
        id: 'app-2',
        jobId: 'job-1',
        applicantId: 'friend-1',
        status: 'PENDING',
        groupId: null,
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
        applicant: {
          id: 'friend-1',
          name: 'Friend Name',
          displayName: 'Friend Display',
          avatarUrl: 'friend.png',
        },
      },
      {
        id: 'app-3',
        jobId: 'job-1',
        applicantId: 'other-1',
        status: 'PENDING',
        groupId: null,
        createdAt: new Date('2024-01-03'),
        updatedAt: new Date('2024-01-03'),
        applicant: {
          id: 'other-1',
          name: 'Other Name',
          displayName: 'Other Display',
          avatarUrl: 'other.png',
        },
      },
    ]);

    const list = await getJobApplicantsForUser('job-1');

    expect(list).toHaveLength(3);
    const self = list[0];
    const friend = list[1];
    const anon = list[2];

    expect(self.isSelf).toBe(true);
    expect(self.displayName).toBe('Self Display');
    expect(friend.isFriend).toBe(true);
    expect(friend.displayName).toBe('Friend Display');
    expect(anon.isFriend).toBe(false);
    expect(anon.avatarUrl).toBeNull();
    expect(anon.displayName).toContain('応募者');
  });
});
