/*
  Warnings:

  - You are about to drop the `GroupUser` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `leaderId` to the `Group` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxMembers` to the `Job` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."MemberStatus" AS ENUM ('PENDING', 'APPLYING', 'NOT_APPLYING');

-- CreateEnum
CREATE TYPE "public"."ApplicationStatus" AS ENUM ('SUBMITTED', 'APPROVED', 'REJECTED');

-- DropForeignKey
ALTER TABLE "public"."GroupUser" DROP CONSTRAINT "GroupUser_groupId_fkey";

-- DropForeignKey
ALTER TABLE "public"."GroupUser" DROP CONSTRAINT "GroupUser_userId_fkey";

-- AlterTable
ALTER TABLE "public"."Application" ADD COLUMN     "status" "public"."ApplicationStatus" NOT NULL DEFAULT 'SUBMITTED';

-- AlterTable
ALTER TABLE "public"."Group" ADD COLUMN     "leaderId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."Job" ADD COLUMN     "maxMembers" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "avatar" TEXT;

-- DropTable
DROP TABLE "public"."GroupUser";

-- CreateTable
CREATE TABLE "public"."GroupMember" (
    "id" SERIAL NOT NULL,
    "groupId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "status" "public"."MemberStatus" NOT NULL DEFAULT 'PENDING',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroupMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GroupMember_groupId_userId_key" ON "public"."GroupMember"("groupId", "userId");

-- AddForeignKey
ALTER TABLE "public"."Group" ADD CONSTRAINT "Group_leaderId_fkey" FOREIGN KEY ("leaderId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GroupMember" ADD CONSTRAINT "GroupMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "public"."Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GroupMember" ADD CONSTRAINT "GroupMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
