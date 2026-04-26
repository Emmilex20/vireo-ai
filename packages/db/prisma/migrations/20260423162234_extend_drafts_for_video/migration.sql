-- AlterTable
ALTER TABLE "PromptDraft" ADD COLUMN     "cameraMove" TEXT,
ADD COLUMN     "duration" INTEGER,
ADD COLUMN     "fps" INTEGER,
ADD COLUMN     "motionGuidance" INTEGER,
ADD COLUMN     "motionIntensity" TEXT,
ADD COLUMN     "shotType" TEXT,
ADD COLUMN     "styleStrength" TEXT,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'image';
