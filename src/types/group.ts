import type {
  Application as PrismaApplication,
  Group as PrismaGroup,
  GroupUser as PrismaGroupUser,
  Job as PrismaJob,
  WaitingRoom as PrismaWaitingRoom
} from '@prisma/client';
import type { User } from './user';

// Prismaの型を直接使用
export type Group = PrismaGroup & {
  waitingRoom?: WaitingRoom;
  leader?: User;
  members?: GroupUser[];
  applications?: Application[];
};

export type GroupUser = PrismaGroupUser & {
  group?: Group;
  user?: User;
};

export type Application = PrismaApplication;

export type WaitingRoom = PrismaWaitingRoom & {
  job?: Job;
  groups?: Group[];
};

export type Job = PrismaJob;

export type CreateGroupInput = {
  name: string;
  waitingRoomId: number;
  leaderId: number;
};

export type WaitingRoomWithMembers = WaitingRoom & {
  groups: (Group & {
    members: (GroupUser & {
      user: User;
    })[];
  })[];
};

// Prismaのincludeを使用した場合の戻り値の型
export type GroupWithRelations = PrismaGroup & {
  leader: User;
  members: (PrismaGroupUser & {
    user: User;
  })[];
  applications: PrismaApplication[];
  waitingRoom: PrismaWaitingRoom & {
    job: PrismaJob;
  };
};

// Prismaのenumを直接使用
export type MemberStatus = import('@prisma/client').$Enums.MemberStatus;
export type ApplicationStatus = import('@prisma/client').$Enums.ApplicationStatus;
export type UserType = import('@prisma/client').$Enums.UserType;
export type JobStatus = import('@prisma/client').$Enums.JobStatus;