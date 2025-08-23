/*
  Warnings:

  - You are about to drop the column `jobId` on the `Group` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[waitingRoomId,name]` on the table `Group` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `waitingRoomId` to the `Group` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Group" DROP CONSTRAINT "Group_jobId_fkey";

-- AlterTable
ALTER TABLE "public"."Application" ADD COLUMN     "isConfirmed" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."Group" DROP COLUMN "jobId",
ADD COLUMN     "waitingRoomId" INTEGER NOT NULL,
ALTER COLUMN "leaderId" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "address" TEXT,
ADD COLUMN     "emergencyContact" TEXT,
ADD COLUMN     "phone" TEXT;

-- CreateTable
CREATE TABLE "public"."WaitingRoom" (
    "id" SERIAL NOT NULL,
    "jobId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isOpen" BOOLEAN NOT NULL DEFAULT true,
    "maxGroups" INTEGER NOT NULL DEFAULT 5,

    CONSTRAINT "WaitingRoom_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WaitingRoom_jobId_key" ON "public"."WaitingRoom"("jobId");

-- CreateIndex
CREATE UNIQUE INDEX "Group_waitingRoomId_name_key" ON "public"."Group"("waitingRoomId", "name");

-- AddForeignKey
ALTER TABLE "public"."WaitingRoom" ADD CONSTRAINT "WaitingRoom_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "public"."Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Group" ADD CONSTRAINT "Group_waitingRoomId_fkey" FOREIGN KEY ("waitingRoomId") REFERENCES "public"."WaitingRoom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
