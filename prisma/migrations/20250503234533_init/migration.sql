-- CreateTable
CREATE TABLE "BrewingDevice" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrewingDevice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserBrewingDevice" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "brewingDeviceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserBrewingDevice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserBrewSession" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "brewingDeviceId" TEXT NOT NULL,
    "brewTime" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserBrewSession_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserBrewingDevice" ADD CONSTRAINT "UserBrewingDevice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBrewingDevice" ADD CONSTRAINT "UserBrewingDevice_brewingDeviceId_fkey" FOREIGN KEY ("brewingDeviceId") REFERENCES "BrewingDevice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBrewSession" ADD CONSTRAINT "UserBrewSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBrewSession" ADD CONSTRAINT "UserBrewSession_brewingDeviceId_fkey" FOREIGN KEY ("brewingDeviceId") REFERENCES "BrewingDevice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
