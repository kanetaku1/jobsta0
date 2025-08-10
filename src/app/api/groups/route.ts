import { main } from '@/lib/prisma';
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

export const GET = async (_req: Request) => {
    try {
        await main()
        const groups = await prisma.group.findMany();
        return NextResponse.json({ message: "Success", groups}, { status: 200});
    } catch (err) {
        return NextResponse.json({ message: "Error", err}, { status: 500});
    } finally {
        await prisma.$disconnect();
    }
}