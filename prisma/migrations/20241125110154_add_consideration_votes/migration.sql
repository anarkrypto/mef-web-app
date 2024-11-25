-- CreateEnum
CREATE TYPE "ConsiderationDecision" AS ENUM ('APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "ConsiderationVote" (
    "id" UUID NOT NULL,
    "proposalId" INTEGER NOT NULL,
    "voterId" UUID NOT NULL,
    "decision" "ConsiderationDecision" NOT NULL,
    "feedback" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ConsiderationVote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ConsiderationVote_voterId_idx" ON "ConsiderationVote"("voterId");

-- CreateIndex
CREATE UNIQUE INDEX "ConsiderationVote_proposalId_voterId_key" ON "ConsiderationVote"("proposalId", "voterId");

-- AddForeignKey
ALTER TABLE "ConsiderationVote" ADD CONSTRAINT "ConsiderationVote_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsiderationVote" ADD CONSTRAINT "ConsiderationVote_voterId_fkey" FOREIGN KEY ("voterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
