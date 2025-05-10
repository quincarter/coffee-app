-- CreateTable
CREATE TABLE "RoasterLocation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "mapsLink" TEXT,
    "phoneNumber" TEXT,
    "image" TEXT,
    "isMainLocation" BOOLEAN NOT NULL DEFAULT false,
    "roasterId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoasterLocation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RoasterLocation" ADD CONSTRAINT "RoasterLocation_roasterId_fkey" FOREIGN KEY ("roasterId") REFERENCES "CoffeeRoaster"("id") ON DELETE CASCADE ON UPDATE CASCADE;
