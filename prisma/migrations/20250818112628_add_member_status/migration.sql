/*
  Warnings:

  - A unique constraint covering the columns `[groupId,userId]` on the table `GroupUser` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."MemberStatus" AS ENUM ('PENDING', 'APPLYING', 'NOT_APPLYING');

-- AlterTable
ALTER TABLE "public"."GroupUser" ADD COLUMN     "status" "public"."MemberStatus" NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE UNIQUE INDEX "GroupUser_groupId_userId_key" ON "public"."GroupUser"("groupId", "userId");
