-- DropForeignKey
ALTER TABLE "UserBrewingDevice" DROP CONSTRAINT "UserBrewingDevice_userId_fkey";

-- AlterTable
ALTER TABLE "UserBrewingDevice" ADD COLUMN     "image" TEXT,
ALTER COLUMN "description" DROP NOT NULL;

-- CreateTable
CREATE TABLE "_UserBrewSessionToUserBrewingDevice" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_UserBrewSessionToUserBrewingDevice_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_UserBrewSessionToUserBrewingDevice_B_index" ON "_UserBrewSessionToUserBrewingDevice"("B");

-- AddForeignKey
ALTER TABLE "UserBrewingDevice" ADD CONSTRAINT "UserBrewingDevice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserBrewSessionToUserBrewingDevice" ADD CONSTRAINT "_UserBrewSessionToUserBrewingDevice_A_fkey" FOREIGN KEY ("A") REFERENCES "UserBrewSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserBrewSessionToUserBrewingDevice" ADD CONSTRAINT "_UserBrewSessionToUserBrewingDevice_B_fkey" FOREIGN KEY ("B") REFERENCES "UserBrewingDevice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
