ALTER TABLE "PromptDraft"
ADD COLUMN "resolution" TEXT,
ADD COLUMN "draftMode" BOOLEAN,
ADD COLUMN "saveAudio" BOOLEAN,
ADD COLUMN "promptUpsampling" BOOLEAN,
ADD COLUMN "disableSafetyFilter" BOOLEAN,
ADD COLUMN "imageUrl" TEXT,
ADD COLUMN "sourceAssetId" TEXT;
