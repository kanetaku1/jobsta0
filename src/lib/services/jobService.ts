import { prisma } from '@/lib/prisma';
import { Job } from '@/types/job';

// CI環境用のモックデータ
const mockJobs: Job[] = [
  {
    id: 1,
    title: 'モック求人1',
    description: 'これはCI環境用のモックデータです',
    wage: 1000,
    jobDate: new Date(),
    createdAt: new Date(),
    maxMembers: 10,
  },
  {
    id: 2,
    title: 'モック求人2',
    description: 'これはCI環境用のモックデータです',
    wage: 1200,
    jobDate: new Date(),
    createdAt: new Date(),
    maxMembers: 15,
  },
];

export class JobService {
  /**
   * 全求人を取得する
   */
  static async getAllJobs(): Promise<Job[]> {
    // CI環境の場合はモックデータを返す
    if (process.env.NODE_ENV === 'test' || !process.env.DATABASE_URL) {
      return mockJobs;
    }

    try {
      const jobs = await prisma.job.findMany({
        orderBy: {
          createdAt: 'desc',
        },
      });
      return jobs;
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      throw new Error('求人の取得に失敗しました');
    }
  }

  /**
   * 求人をIDで取得する
   */
  static async getJobById(id: number): Promise<Job | null> {
    // CI環境の場合はモックデータを返す
    if (process.env.NODE_ENV === 'test' || !process.env.DATABASE_URL) {
      return mockJobs.find(job => job.id === id) || null;
    }

    try {
      const job = await prisma.job.findUnique({
        where: { id },
      });
      return job;
    } catch (error) {
      console.error('Failed to fetch job:', error);
      throw new Error('求人の取得に失敗しました');
    }
  }
}
