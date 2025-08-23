/*
  Warnings:

  - You are about to drop the column `status` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `leaderId` on the `Group` table. All the data in the column will be lost.
  - You are about to drop the column `maxMembers` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `avatar` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `GroupMember` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Group" DROP CONSTRAINT "Group_leaderId_fkey";

-- DropForeignKey
ALTER TABLE "public"."GroupMember" DROP CONSTRAINT "GroupMember_groupId_fkey";

-- DropForeignKey
ALTER TABLE "public"."GroupMember" DROP CONSTRAINT "GroupMember_userId_fkey";

-- AlterTable
ALTER TABLE "public"."Application" DROP COLUMN "status";

-- AlterTable
ALTER TABLE "public"."Group" DROP COLUMN "leaderId";

-- AlterTable
ALTER TABLE "public"."Job" DROP COLUMN "maxMembers";

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "avatar";

-- DropTable
DROP TABLE "public"."GroupMember";

-- DropEnum
DROP TYPE "public"."ApplicationStatus";

-- DropEnum
DROP TYPE "public"."MemberStatus";

-- CreateTable
CREATE TABLE "public"."GroupUser" (
    "id" SERIAL NOT NULL,
    "groupId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroupUser_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."GroupUser" ADD CONSTRAINT "GroupUser_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "public"."Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GroupUser" ADD CONSTRAINT "GroupUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
