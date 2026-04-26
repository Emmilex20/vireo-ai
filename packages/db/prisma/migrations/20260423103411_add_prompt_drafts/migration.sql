-- CreateTable
CREATE TABLE "PromptDraft" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "negativePrompt" TEXT,
    "style" TEXT,
    "aspectRatio" TEXT,
    "qualityMode" TEXT,
    "promptBoost" BOOLEAN NOT NULL DEFAULT true,
    "seed" INTEGER,
    "steps" INTEGER,
    "guidance" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromptDraft_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PromptDraft" ADD CONSTRAINT "PromptDraft_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
