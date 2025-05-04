/*
  Warnings:

  - You are about to drop the column `userRole` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "userRole",
ADD COLUMN     "backgroundImage" TEXT,
ADD COLUMN     "backgroundOpacity" DOUBLE PRECISION DEFAULT 0.8,
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'user';
