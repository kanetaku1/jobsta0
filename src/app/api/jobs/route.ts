import { main } from '@/lib/prisma';
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient()

// 全求人取得API
export const GET = async (_req: Request, _res: NextResponse, { params }: { params: Promise<string> }) => {
    try {
        await main()
        const jobs = await prisma.job.findMany();
        return NextResponse.json({ message: "Success", jobs}, { status: 200});
    } catch (err) {
        return NextResponse.json({ message: "Error", err}, { status: 500});
    } finally {
        await prisma.$disconnect();
    }
}
