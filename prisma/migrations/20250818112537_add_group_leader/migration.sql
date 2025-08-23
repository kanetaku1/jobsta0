-- AlterTable
ALTER TABLE "public"."Group" ADD COLUMN     "leaderId" INTEGER NOT NULL DEFAULT 1;

-- AddForeignKey
ALTER TABLE "public"."Group" ADD CONSTRAINT "Group_leaderId_fkey" FOREIGN KEY ("leaderId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
