-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "roasterId" TEXT;

-- CreateIndex
CREATE INDEX "Comment_roasterId_idx" ON "Comment"("roasterId");

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_roasterId_fkey" FOREIGN KEY ("roasterId") REFERENCES "CoffeeRoaster"("id") ON DELETE CASCADE ON UPDATE CASCADE;
