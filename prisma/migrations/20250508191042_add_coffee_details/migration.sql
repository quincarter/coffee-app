-- AlterTable
ALTER TABLE "Coffee" ADD COLUMN     "countryOfOrigin" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "elevation" TEXT,
ADD COLUMN     "process" TEXT;

-- CreateTable
CREATE TABLE "CoffeeTastingNote" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoffeeTastingNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoffeeOrigin" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoffeeOrigin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoffeeProcess" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoffeeProcess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CoffeeToTastingNote" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CoffeeToTastingNote_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "CoffeeTastingNote_name_key" ON "CoffeeTastingNote"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CoffeeOrigin_name_key" ON "CoffeeOrigin"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CoffeeProcess_name_key" ON "CoffeeProcess"("name");

-- CreateIndex
CREATE INDEX "_CoffeeToTastingNote_B_index" ON "_CoffeeToTastingNote"("B");

-- AddForeignKey
ALTER TABLE "_CoffeeToTastingNote" ADD CONSTRAINT "_CoffeeToTastingNote_A_fkey" FOREIGN KEY ("A") REFERENCES "Coffee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CoffeeToTastingNote" ADD CONSTRAINT "_CoffeeToTastingNote_B_fkey" FOREIGN KEY ("B") REFERENCES "CoffeeTastingNote"("id") ON DELETE CASCADE ON UPDATE CASCADE;
