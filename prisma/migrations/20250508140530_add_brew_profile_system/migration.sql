-- AlterTable
ALTER TABLE "UserBrewSession" ADD COLUMN     "brewProfileId" TEXT;

-- CreateTable
CREATE TABLE "CoffeeRoaster" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "mapsLink" TEXT,
    "phoneNumber" TEXT,
    "notes" TEXT,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoffeeRoaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Coffee" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "roasterId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Coffee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrewProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "coffeeId" TEXT NOT NULL,
    "brewDeviceId" TEXT NOT NULL,
    "waterAmount" DOUBLE PRECISION NOT NULL,
    "coffeeAmount" DOUBLE PRECISION NOT NULL,
    "ratio" TEXT NOT NULL,
    "roasterNotes" TEXT,
    "tastingNotes" TEXT,
    "roastDate" TIMESTAMP(3),
    "wash" TEXT,
    "process" TEXT,
    "roastLevel" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrewProfile_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserBrewSession" ADD CONSTRAINT "UserBrewSession_brewProfileId_fkey" FOREIGN KEY ("brewProfileId") REFERENCES "BrewProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Coffee" ADD CONSTRAINT "Coffee_roasterId_fkey" FOREIGN KEY ("roasterId") REFERENCES "CoffeeRoaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrewProfile" ADD CONSTRAINT "BrewProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrewProfile" ADD CONSTRAINT "BrewProfile_coffeeId_fkey" FOREIGN KEY ("coffeeId") REFERENCES "Coffee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrewProfile" ADD CONSTRAINT "BrewProfile_brewDeviceId_fkey" FOREIGN KEY ("brewDeviceId") REFERENCES "BrewingDevice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
