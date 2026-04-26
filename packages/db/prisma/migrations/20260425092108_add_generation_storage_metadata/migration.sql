-- AlterTable
ALTER TABLE "GenerationJob" ADD COLUMN     "storageProvider" TEXT,
ADD COLUMN     "storageReason" TEXT,
ADD COLUMN     "storageStatus" TEXT,
ADD COLUMN     "storageUrl" TEXT;
