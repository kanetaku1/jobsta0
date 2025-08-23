-- CreateEnum
CREATE TYPE "public"."ApplicationStatus" AS ENUM ('SUBMITTED', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "public"."Application" ADD COLUMN     "status" "public"."ApplicationStatus" NOT NULL DEFAULT 'SUBMITTED';
