-- CreateEnum
CREATE TYPE "BannerColor" AS ENUM ('success', 'info', 'danger', 'warning', 'neutral');

-- CreateTable
CREATE TABLE "AdminBanner" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "color" "BannerColor" NOT NULL DEFAULT 'neutral',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDismissable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminBanner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserDismissedBanner" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bannerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserDismissedBanner_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserDismissedBanner_userId_bannerId_key" ON "UserDismissedBanner"("userId", "bannerId");

-- AddForeignKey
ALTER TABLE "UserDismissedBanner" ADD CONSTRAINT "UserDismissedBanner_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDismissedBanner" ADD CONSTRAINT "UserDismissedBanner_bannerId_fkey" FOREIGN KEY ("bannerId") REFERENCES "AdminBanner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
