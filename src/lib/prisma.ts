import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// export async function main() {
//     try {
//         await prisma.$connect()
//     } catch (err) {
//         return Error("DB接続に失敗しました")
//     }
// }