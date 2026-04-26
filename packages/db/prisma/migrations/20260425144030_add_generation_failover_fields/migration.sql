-- AlterTable
ALTER TABLE "GenerationJob" ADD COLUMN     "failoverAt" TIMESTAMP(3),
ADD COLUMN     "failoverReason" TEXT,
ADD COLUMN     "fallbackProviderName" TEXT;
