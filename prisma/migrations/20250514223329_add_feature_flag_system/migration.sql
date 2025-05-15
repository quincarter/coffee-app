-- CreateTable
CREATE TABLE "FeatureFlag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT,
    "allowedRoles" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "FeatureFlag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeatureFlagAccess" (
    "id" TEXT NOT NULL,
    "featureFlagId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeatureFlagAccess_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FeatureFlag_name_key" ON "FeatureFlag"("name");

-- CreateIndex
CREATE INDEX "FeatureFlag_createdBy_idx" ON "FeatureFlag"("createdBy");

-- CreateIndex
CREATE INDEX "FeatureFlag_updatedBy_idx" ON "FeatureFlag"("updatedBy");

-- CreateIndex
CREATE INDEX "FeatureFlagAccess_featureFlagId_idx" ON "FeatureFlagAccess"("featureFlagId");

-- CreateIndex
CREATE INDEX "FeatureFlagAccess_userId_idx" ON "FeatureFlagAccess"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FeatureFlagAccess_featureFlagId_userId_key" ON "FeatureFlagAccess"("featureFlagId", "userId");

-- AddForeignKey
ALTER TABLE "FeatureFlag" ADD CONSTRAINT "FeatureFlag_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeatureFlag" ADD CONSTRAINT "FeatureFlag_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeatureFlagAccess" ADD CONSTRAINT "FeatureFlagAccess_featureFlagId_fkey" FOREIGN KEY ("featureFlagId") REFERENCES "FeatureFlag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeatureFlagAccess" ADD CONSTRAINT "FeatureFlagAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
