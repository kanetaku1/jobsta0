export type Group = {
  id: number;
  name: string;
  waitingRoomId: number;
  leaderId: number;
  createdAt: Date;
  waitingRoom?: WaitingRoom;
  leader?: User;
  members?: GroupUser[];
  applications?: Application[];
};

export type GroupUser = {
  id: number;
  groupId: number;
  userId: number;
  status: MemberStatus;
  joinedAt: Date;
  group?: Group;
  user?: User;
};

export type User = {
  id: number;
  email: string;
  name: string | null;
  avatar: string | null;
  createdAt: Date;
  phone: string | null;
  address: string | null;
  emergencyContact: string | null;
};

export type Application = {
  id: number;
  groupId: number;
  submittedAt: Date;
  status: ApplicationStatus;
  isConfirmed: boolean;
};

export type WaitingRoom = {
  id: number;
  jobId: number;
  createdAt: Date;
  isOpen: boolean;
  maxGroups: number;
  job?: Job;
  groups?: Group[];
};

export type Job = {
  id: number;
  title: string;
  description: string | null;
  wage: number;
  jobDate: Date;
  maxMembers: number;
  createdAt: Date;
};

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

export enum MemberStatus {
  PENDING = 'PENDING',
  APPLYING = 'APPLYING',
  NOT_APPLYING = 'NOT_APPLYING'
}

export enum ApplicationStatus {
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}
