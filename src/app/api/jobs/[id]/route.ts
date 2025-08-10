import { main } from '@/lib/prisma';
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient()

// 求人詳細取得API
export const GET = async (req: Request, _res: NextResponse, { params }: { params: Promise<string> }) => {
    try {
        const id: number = parseInt(req.url.split("/jobs/")[1]); //http://localhost:3000/api/jobs/1
        await main()
        const job = await prisma.job.findFirst({ where: { id }});
        return NextResponse.json({ message: "Success", job}, { status: 200});
    } catch (err) {
        return NextResponse.json({ message: "Error", err}, { status: 500});
    } finally {
        await prisma.$disconnect();
    }
}