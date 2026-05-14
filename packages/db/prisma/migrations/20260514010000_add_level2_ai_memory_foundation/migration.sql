-- CreateTable
CREATE TABLE "CharacterProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "visualTraits" TEXT,
    "outfit" TEXT,
    "style" TEXT,
    "voiceNotes" TEXT,
    "referenceImageUrl" TEXT,
    "preferredPromptFragment" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CharacterProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoryMemory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "genre" TEXT,
    "tone" TEXT,
    "worldSetting" TEXT,
    "characters" JSONB,
    "previousSceneSummaries" JSONB,
    "nextSceneNotes" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoryMemory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CharacterProfile_userId_updatedAt_idx" ON "CharacterProfile"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "CharacterProfile_userId_name_idx" ON "CharacterProfile"("userId", "name");

-- CreateIndex
CREATE INDEX "StoryMemory_userId_updatedAt_idx" ON "StoryMemory"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "StoryMemory_userId_title_idx" ON "StoryMemory"("userId", "title");

-- AddForeignKey
ALTER TABLE "CharacterProfile" ADD CONSTRAINT "CharacterProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryMemory" ADD CONSTRAINT "StoryMemory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
