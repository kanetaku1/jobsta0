import { prisma } from '@/lib/prisma'
import { Job } from '@/types/job'

export class JobService {
    /**
     * 全求人を取得する
     */
    static async getAllJobs(): Promise<Job[]> {
        try {
            const jobs = await prisma.job.findMany({
                orderBy: {
                    createdAt: 'desc',
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
    static async getJobById(id: number): Promise<Job | null> {
        try {
            const job = await prisma.job.findUnique({
                where: { id },
                include: {
                    groups: true,
                },
            })
            return job
        } catch (error) {
            console.error('Failed to fetch job:', error)
            throw new Error('求人の取得に失敗しました')
        }
    }
}
