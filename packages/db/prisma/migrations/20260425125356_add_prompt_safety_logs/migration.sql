-- CreateTable
CREATE TABLE "PromptSafetyLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "prompt" TEXT NOT NULL,
    "negativePrompt" TEXT,
    "reason" TEXT NOT NULL,
    "matchedTerm" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromptSafetyLog_pkey" PRIMARY KEY ("id")
);
