import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { defineConfig, env } from "prisma/config"

const sharedEnvPath = path.resolve(__dirname, "../../apps/web/.env.local")

if (existsSync(sharedEnvPath)) {
  const sharedEnv = readFileSync(sharedEnvPath, "utf8")

  for (const line of sharedEnv.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/)

    if (!match) {
      continue
    }

    const [, key, rawValue] = match

    if (process.env[key]) {
      continue
    }

    const value = rawValue.replace(/^(['"])(.*)\1$/, "$2")
    process.env[key] = value
  }
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
})
