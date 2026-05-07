CREATE TABLE "HomepageItem" (
  "id" TEXT NOT NULL,
  "section" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "subtitle" TEXT,
  "href" TEXT,
  "mediaType" TEXT NOT NULL,
  "mediaUrl" TEXT NOT NULL,
  "posterUrl" TEXT,
  "sourceAssetId" TEXT,
  "sourceGenerationJobId" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdByAdminId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "HomepageItem_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "HomepageItem_section_isActive_sortOrder_createdAt_idx" ON "HomepageItem"("section", "isActive", "sortOrder", "createdAt");
CREATE INDEX "HomepageItem_sourceAssetId_idx" ON "HomepageItem"("sourceAssetId");
CREATE INDEX "HomepageItem_sourceGenerationJobId_idx" ON "HomepageItem"("sourceGenerationJobId");

ALTER TABLE "HomepageItem" ADD CONSTRAINT "HomepageItem_createdByAdminId_fkey" FOREIGN KEY ("createdByAdminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "HomepageItem" ADD CONSTRAINT "HomepageItem_sourceAssetId_fkey" FOREIGN KEY ("sourceAssetId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "HomepageItem" ADD CONSTRAINT "HomepageItem_sourceGenerationJobId_fkey" FOREIGN KEY ("sourceGenerationJobId") REFERENCES "GenerationJob"("id") ON DELETE SET NULL ON UPDATE CASCADE;
