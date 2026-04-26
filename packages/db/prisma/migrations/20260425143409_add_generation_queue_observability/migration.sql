-- AlterTable
ALTER TABLE "GenerationJob" ADD COLUMN     "lastCheckedAt" TIMESTAMP(3),
ADD COLUMN     "queueAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "queueLastError" TEXT;
