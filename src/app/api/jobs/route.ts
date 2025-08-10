import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient()

export async function main() {
    try {
        await prisma.$connect()
    } catch (err) {
        return Error("DB接続に失敗しました")
    }
}

// 全求人取得API
export const GET = async (req: Request, res: NextResponse) => {
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
