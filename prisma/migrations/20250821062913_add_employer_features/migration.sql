/*
  Warnings:

  - Added the required column `creatorId` to the `Job` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."UserType" AS ENUM ('WORKER', 'EMPLOYER');

-- CreateEnum
CREATE TYPE "public"."JobStatus" AS ENUM ('ACTIVE', 'PAUSED', 'CLOSED', 'COMPLETED');

-- AlterTable
ALTER TABLE "public"."Job" ADD COLUMN     "creatorId" INTEGER NOT NULL,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "requirements" TEXT,
ADD COLUMN     "status" "public"."JobStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "companyAddress" TEXT,
ADD COLUMN     "companyName" TEXT,
ADD COLUMN     "companyPhone" TEXT,
ADD COLUMN     "userType" "public"."UserType" NOT NULL DEFAULT 'WORKER';

-- AddForeignKey
ALTER TABLE "public"."Job" ADD CONSTRAINT "Job_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
