-- Add reserved credit support and idempotent ledger references.
ALTER TABLE "CreditWallet"
ADD COLUMN IF NOT EXISTS "reservedBalance" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "CreditLedger"
ADD COLUMN IF NOT EXISTS "reference" TEXT,
ADD COLUMN IF NOT EXISTS "operationKey" TEXT,
ADD COLUMN IF NOT EXISTS "metadata" JSONB;

CREATE UNIQUE INDEX IF NOT EXISTS "CreditLedger_operationKey_key"
ON "CreditLedger"("operationKey");
