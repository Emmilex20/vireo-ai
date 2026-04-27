CREATE TABLE "AppRuntimeConfig" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "backgroundMode" TEXT NOT NULL DEFAULT 'inline',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppRuntimeConfig_pkey" PRIMARY KEY ("id")
);

INSERT INTO "AppRuntimeConfig" ("id", "backgroundMode", "createdAt", "updatedAt")
VALUES ('default', 'inline', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
