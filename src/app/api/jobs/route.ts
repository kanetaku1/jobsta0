import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// 全求人取得
export async function getJobs() {
    return await prisma.job.findMany({
        include: { postedBy: true },
    });
}

// 新規求人作成
export async function createJob(title: string, wage: number, postedById: string) {
    return await prisma.job.create({
        data: { title, wage, postedById },
    });
}
