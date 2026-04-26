-- AlterTable
ALTER TABLE "GenerationJob" ADD COLUMN     "aspectRatio" TEXT,
ADD COLUMN     "guidance" DOUBLE PRECISION,
ADD COLUMN     "promptBoost" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "qualityMode" TEXT,
ADD COLUMN     "seed" INTEGER,
ADD COLUMN     "steps" INTEGER,
ADD COLUMN     "style" TEXT;
