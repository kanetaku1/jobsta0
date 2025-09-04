// 型の検証とガード

import type { Application, Group, Job, WaitingRoom } from './group'
import type { User } from './user'
import type { WaitingRoomWithFullDetails } from './services'

// 基本的な型ガード
export function isJob(data: any): data is Job {
  return (
    data &&
    typeof data.id === 'number' &&
    typeof data.title === 'string' &&
    typeof data.wage === 'number' &&
    data.jobDate instanceof Date &&
    typeof data.maxMembers === 'number' &&
    typeof data.status === 'string' &&
    typeof data.creatorId === 'number' &&
    data.createdAt instanceof Date
  )
}

export function isUser(data: any): data is User {
  return (
    data &&
    typeof data.id === 'number' &&
    typeof data.email === 'string' &&
    typeof data.userType === 'string' &&
    data.createdAt instanceof Date
  )
}

export function isGroup(data: any): data is Group {
  return (
    data &&
    typeof data.id === 'number' &&
    typeof data.name === 'string' &&
    typeof data.waitingRoomId === 'number' &&
    typeof data.leaderId === 'number' &&
    data.createdAt instanceof Date &&
    isUser(data.leader) &&
    Array.isArray(data.members) &&
    Array.isArray(data.applications)
  )
}

export function isWaitingRoom(data: any): data is WaitingRoom {
  return (
    data &&
    typeof data.id === 'number' &&
    typeof data.jobId === 'number' &&
    data.createdAt instanceof Date &&
    typeof data.isOpen === 'boolean' &&
    typeof data.maxGroups === 'number'
  )
}

export function isWaitingRoomWithFullDetails(data: any): data is WaitingRoomWithFullDetails {
  return (
    data &&
    typeof data.id === 'number' &&
    typeof data.jobId === 'number' &&
    data.createdAt instanceof Date &&
    typeof data.isOpen === 'boolean' &&
    typeof data.maxGroups === 'number' &&
    isJob(data.job) &&
    Array.isArray(data.groups) &&
    data.groups.every((group: any) => 
      group &&
      typeof group.id === 'number' &&
      typeof group.name === 'string' &&
      Array.isArray(group.members) &&
      Array.isArray(group.applications)
    )
  )
}

export function isApplication(data: any): data is Application {
  return (
    data &&
    typeof data.id === 'number' &&
    typeof data.groupId === 'number' &&
    data.submittedAt instanceof Date &&
    typeof data.status === 'string' &&
    typeof data.isConfirmed === 'boolean'
  )
}

// 配列の型ガード
export function isJobArray(data: any): data is Job[] {
  return Array.isArray(data) && data.every(isJob)
}

export function isUserArray(data: any): data is User[] {
  return Array.isArray(data) && data.every(isUser)
}

export function isGroupArray(data: any): data is Group[] {
  return Array.isArray(data) && data.every(isGroup)
}

// 型の変換と検証
export function validateAndTransform<T>(
  data: any,
  validator: (data: any) => data is T,
  fallback?: T
): T {
  if (validator(data)) {
    return data
  }
  
  if (fallback !== undefined) {
    return fallback
  }
  
  throw new Error(`Invalid data format for type ${typeof fallback}`)
}

// 安全な型変換
export function safeTransform<T, R>(
  data: T,
  transformer: (data: T) => R,
  validator: (result: R) => boolean
): R | null {
  try {
    const result = transformer(data)
    return validator(result) ? result : null
  } catch {
    return null
  }
}
