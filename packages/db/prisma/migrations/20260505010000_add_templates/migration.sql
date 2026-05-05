CREATE TABLE "Template" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "negativePrompt" TEXT,
    "previewUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "sourceAssetId" TEXT,
    "sourceGenerationJobId" TEXT,
    "modelId" TEXT,
    "settings" JSONB,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdByAdminId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Template_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Template_status_sortOrder_createdAt_idx" ON "Template"("status", "sortOrder", "createdAt");
CREATE INDEX "Template_type_status_idx" ON "Template"("type", "status");
CREATE INDEX "Template_sourceAssetId_idx" ON "Template"("sourceAssetId");
CREATE INDEX "Template_sourceGenerationJobId_idx" ON "Template"("sourceGenerationJobId");

ALTER TABLE "Template" ADD CONSTRAINT "Template_createdByAdminId_fkey" FOREIGN KEY ("createdByAdminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Template" ADD CONSTRAINT "Template_sourceAssetId_fkey" FOREIGN KEY ("sourceAssetId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Template" ADD CONSTRAINT "Template_sourceGenerationJobId_fkey" FOREIGN KEY ("sourceGenerationJobId") REFERENCES "GenerationJob"("id") ON DELETE SET NULL ON UPDATE CASCADE;
