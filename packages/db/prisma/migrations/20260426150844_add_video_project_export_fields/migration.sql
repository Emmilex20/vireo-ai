-- AlterTable
ALTER TABLE "VideoProject" ADD COLUMN     "exportStatus" TEXT,
ADD COLUMN     "exportUrl" TEXT,
ADD COLUMN     "exportedAt" TIMESTAMP(3);
