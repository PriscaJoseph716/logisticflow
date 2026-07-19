-- DropIndex
DROP INDEX IF EXISTS "User_email_key";

-- CreateIndex
CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "User_businessId_email_key" ON "User"("businessId", "email");
