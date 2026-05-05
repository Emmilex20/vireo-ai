import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"
import { Pool } from "pg"

declare global {
  var prisma: PrismaClient | undefined
}

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error("DATABASE_URL is not set")
}

const adapter = new PrismaPg(
  new Pool({
    connectionString,
  })
)

export const db =
  global.prisma ||
  new PrismaClient({
    adapter,
    log: ["query"],
  })

if (process.env.NODE_ENV !== "production") {
  global.prisma = db
}

export * from "./assets"
export * from "./asset-delete"
export * from "./asset-comments"
export * from "./asset-engagement"
export * from "./asset-publish"
export * from "./comments"
export * from "./characters"
export * from "./creators"
export * from "./creator-follow"
export * from "./creator-follow-lists"
export * from "./credits"
export * from "./credit-ledger"
export * from "./discover-creators"
export * from "./generation"
export * from "./generation-failover"
export * from "./generation-queue-meta"
export * from "./following-feed"
export * from "./likes"
export * from "./notifications"
export * from "./payments"
export * from "./payment-status"
export * from "./payment-history"
export * from "./payment-audit"
export * from "./prompt-safety"
export * from "./project-export-refunds"
export * from "./admin-payment-audit"
export * from "./admin-dashboard"
export * from "./admin-analytics"
export * from "./admin-generation-jobs"
export * from "./admin-stuck-jobs"
export * from "./admin-users"
export * from "./admin-user-detail"
export * from "./admin-credit-adjustment"
export * from "./admin-credit-audit"
export * from "./admin-moderation"
export * from "./admin-moderation-audit"
export * from "./admin-subscriptions"
export * from "./publishing"
export * from "./public-gallery"
export * from "./public-asset-detail"
export * from "./recent-image-to-video"
export * from "./referrals"
export * from "./related-generations"
export * from "./runtime-config"
export * from "./saved-assets"
export * from "./scene-refunds"
export * from "./source-asset"
export * from "./subscription-renewals"
export * from "./templates"
export * from "./video-projects"
export * from "./refunds"
export * from "./user"
export * from "./follows"
export * from "./profile"
export * from "./profile-settings"
export * from "./drafts"
export * from "./draft-delete"
