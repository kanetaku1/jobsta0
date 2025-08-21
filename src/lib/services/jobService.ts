import { prisma } from '@/lib/prisma'
import { JobWithWaitingRoom, JobWithWaitingRoomDetails } from '@/types/group'
import { GroupService } from './groupService'

export class JobService {
    /**
     * 全求人を取得する
     */
    static async getAllJobs(): Promise<JobWithWaitingRoom[]> {
        try {
            const jobs = await prisma.job.findMany({
                orderBy: {
                    createdAt: 'desc',
                },
                include: {
                    waitingRoom: {
                        include: {
                            groups: {
                                include: {
                                    _count: {
                                        select: {
                                            members: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            })
            return jobs
        } catch (error) {
            console.error('Failed to fetch jobs:', error)
            throw new Error('求人の取得に失敗しました')
        }
    }

    /**
     * 求人をIDで取得する
     */
    static async getJobById(id: number): Promise<JobWithWaitingRoomDetails | null> {
        try {
            const job = await prisma.job.findUnique({
                where: { id },
                include: {
                    waitingRoom: {
                        include: {
                            groups: {
                                include: {
                                    leader: {
                                        select: {
                                            id: true,
                                            name: true,
                                            avatar: true,
                                        },
                                    },
                                    members: {
                                        include: {
                                            user: {
                                                select: {
                                                    id: true,
                                                    name: true,
                                                    avatar: true,
                                                },
                                            },
                                        },
                                    },
                                    _count: {
                                        select: {
                                            members: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            })
            return job
        } catch (error) {
            console.error('Failed to fetch job:', error)
            throw new Error('求人の取得に失敗しました')
        }
    }

    /**
     * 求人の応募待機ルームを作成する - GroupServiceを使用
     */
    static async createWaitingRoom(jobId: number): Promise<any> {
        return await GroupService.createWaitingRoom(jobId)
    }

    /**
     * 求人の応募待機ルームを取得する - GroupServiceを使用
     */
    static async getWaitingRoom(jobId: number): Promise<any> {
        return await GroupService.getWaitingRoom(jobId)
    }
}
