export type Group = {
    id: number
    name: string
    jobId: number
    createdAt: Date
    job?: {
        id: number
        title: string
        description: string | null
        wage: number
        jobDate: Date
    }
    members?: GroupUser[]
    applications?: Application[]
}

export type GroupUser = {
    id: number
    groupId: number
    userId: number
    joinedAt: Date
    user?: {
        id: number
        email: string
        name: string | null
    }
}

export type Application = {
    id: number
    groupId: number
    submittedAt: Date
}

export type CreateGroupInput = {
    name: string
    jobId: number
}

export type WaitingRoom = {
    jobId: number
    groups: Group[]
}
