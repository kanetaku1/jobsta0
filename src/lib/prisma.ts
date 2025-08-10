import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function main() {
    try {
        await prisma.$connect()
    } catch (err) {
        return Error("DB接続に失敗しました")
    }
}