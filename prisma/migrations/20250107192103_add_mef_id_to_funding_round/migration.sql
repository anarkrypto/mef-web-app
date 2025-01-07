/*
  Warnings:

  - A unique constraint covering the columns `[mefId]` on the table `FundingRound` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "FundingRound" ADD COLUMN     "mefId" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "FundingRound_mefId_key" ON "FundingRound"("mefId");
