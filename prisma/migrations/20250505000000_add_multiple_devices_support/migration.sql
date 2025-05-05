-- CreateTable
CREATE TABLE "BrewSessionDevice" (
  "id" TEXT NOT NULL,
  "brewSessionId" TEXT NOT NULL,
  "brewingDeviceId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "BrewSessionDevice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BrewSessionDevice_brewSessionId_brewingDeviceId_key" ON "BrewSessionDevice"("brewSessionId", "brewingDeviceId");

-- AddForeignKey
ALTER TABLE "BrewSessionDevice" ADD CONSTRAINT "BrewSessionDevice_brewSessionId_fkey" FOREIGN KEY ("brewSessionId") REFERENCES "UserBrewSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrewSessionDevice" ADD CONSTRAINT "BrewSessionDevice_brewingDeviceId_fkey" FOREIGN KEY ("brewingDeviceId") REFERENCES "BrewingDevice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;