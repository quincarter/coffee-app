-- CreateEnum
CREATE TYPE "CoffeeVariety" AS ENUM ('single_origin', 'blend', 'microlot', 'seasonal', 'signature_blend');

-- AlterTable
ALTER TABLE "Coffee" ADD COLUMN     "isRetired" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "productUrl" TEXT,
ADD COLUMN     "retiredAt" TIMESTAMP(3),
ADD COLUMN     "variety" "CoffeeVariety" DEFAULT 'single_origin';

-- AlterTable
ALTER TABLE "UserBrewingDevice" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;
