/*
  Warnings:

  - Added the required column `jobId` to the `Application` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Application` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Application" DROP CONSTRAINT "Application_groupId_fkey";

-- AlterTable
ALTER TABLE "public"."Application" ADD COLUMN     "jobId" INTEGER NOT NULL,
ADD COLUMN     "userId" INTEGER NOT NULL,
ALTER COLUMN "groupId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Application" ADD CONSTRAINT "Application_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "public"."Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Application" ADD CONSTRAINT "Application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Application" ADD CONSTRAINT "Application_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "public"."Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
