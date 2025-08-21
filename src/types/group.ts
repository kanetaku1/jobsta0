export interface User {
  id: number
  email: string
  name: string | null
  avatar: string | null
  phone: string | null
  address: string | null
  emergencyContact: string | null
  createdAt: Date
}

export interface Job {
  id: number
  title: string
  description: string | null
  wage: number
  jobDate: Date
  maxMembers: number
  createdAt: Date
}

export interface GroupMember {
  id: number
  groupId: number
  userId: number
  status: MemberStatus
  joinedAt: Date
  user: User
}

// 循環参照を避けるために、基本的な型定義
export interface GroupBase {
  id: number
  name: string
  waitingRoomId: number
  leaderId: number
  createdAt: Date
  leader: User
  members: GroupMember[]
}

export interface WaitingRoomBase {
  id: number
  jobId: number
  createdAt: Date
  isOpen: boolean
  maxGroups: number
  job: Job
}

// 完全な型定義（循環参照なし）
export interface Group extends GroupBase {
  waitingRoom: WaitingRoomBase
}

export interface WaitingRoom extends WaitingRoomBase {
  groups: GroupBase[]
}

export type MemberStatus = 'PENDING' | 'APPLYING' | 'NOT_APPLYING'
export type ApplicationStatus = 'SUBMITTED' | 'APPROVED' | 'REJECTED'

export interface Application {
  id: number
  groupId: number
  submittedAt: Date
  status: ApplicationStatus
  isConfirmed: boolean
  group: Group
}

// Prismaの戻り値と一致する型定義
export interface WaitingRoomWithGroups extends Omit<WaitingRoom, 'groups'> {
  groups: (GroupBase & {
    _count: {
      members: number
    }
  })[]
}

export interface GroupWithDetails extends GroupBase {
  _count?: {
    members: number
  }
}

// Prismaのinclude結果と一致する型定義
export interface JobWithWaitingRoom extends Job {
  waitingRoom: {
    groups: {
      _count: {
        members: number
      }
    }[]
  } | null
}

// 待機ルーム取得時の型定義
export interface WaitingRoomWithMembers extends WaitingRoomBase {
  groups: {
    id: number
    name: string
    waitingRoomId: number
    leaderId: number
    createdAt: Date
    leader: {
      id: number
      name: string | null
      avatar: string | null
    }
    members: {
      id: number
      groupId: number
      userId: number
      status: MemberStatus
      joinedAt: Date
      user: {
        id: number
        name: string | null
        avatar: string | null
        phone: string | null
        address: string | null
        emergencyContact: string | null
      }
    }[]
  }[]
}

export interface JobWithWaitingRoomDetails extends Job {
  waitingRoom: {
    groups: {
      leader: {
        id: number
        name: string | null
        avatar: string | null
      }
      members: {
        user: {
          id: number
          name: string | null
          avatar: string | null
        }
      }[]
      _count: {
        members: number
      }
    }[]
  } | null
}

// GroupServiceの戻り値と一致する型定義
export interface WaitingRoomWithProcessedGroups extends Omit<WaitingRoom, 'groups'> {
  groups: {
    id: number
    name: string
    waitingRoomId: number
    leaderId: number
    createdAt: Date
    leader: {
      id: number
      name: string | null
      avatar: string | null
    }
    members: {
      id: number
      status: MemberStatus
      user: {
        id: number
        name: string
        avatar: string | null
      }
    }[]
    memberCount: number
    _count: {
      members: number
    }
  }[]
}