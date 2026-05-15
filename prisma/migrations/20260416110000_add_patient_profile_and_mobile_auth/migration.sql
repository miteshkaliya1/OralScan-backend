-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY');

-- CreateEnum
CREATE TYPE "TobaccoHistory" AS ENUM ('NEVER', 'FORMER', 'OCCASIONAL', 'DAILY');

-- AlterTable
ALTER TABLE "User"
  ALTER COLUMN "email" DROP NOT NULL,
  ADD COLUMN "mobileNumber" TEXT,
  ADD COLUMN "age" INTEGER,
  ADD COLUMN "gender" "Gender",
  ADD COLUMN "address" TEXT,
  ADD COLUMN "tobaccoGutkaHistory" "TobaccoHistory",
  ADD COLUMN "tobaccoGutkaDetails" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_mobileNumber_key" ON "User"("mobileNumber");
