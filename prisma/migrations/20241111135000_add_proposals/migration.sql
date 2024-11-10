-- CreateEnum
CREATE TYPE "ProposalStatus" AS ENUM ('DRAFT', 'CONSIDERATION', 'DELIBERATION', 'VOTING', 'APPROVED', 'REJECTED', 'WITHDRAWN');

-- CreateTable
CREATE TABLE "Proposal" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "status" "ProposalStatus" NOT NULL DEFAULT 'DRAFT',
    "proposalName" VARCHAR(100) NOT NULL,
    "abstract" TEXT NOT NULL,
    "motivation" TEXT NOT NULL,
    "rationale" TEXT NOT NULL,
    "deliveryRequirements" TEXT NOT NULL,
    "securityAndPerformance" TEXT NOT NULL,
    "budgetRequest" DECIMAL(16,2) NOT NULL,
    "discord" VARCHAR(32) NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Proposal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Proposal_userId_idx" ON "Proposal"("userId");

-- CreateIndex
CREATE INDEX "Proposal_status_idx" ON "Proposal"("status");

-- CreateIndex
CREATE INDEX "Proposal_proposalName_idx" ON "Proposal"("proposalName");

-- CreateIndex
CREATE INDEX "Proposal_createdAt_idx" ON "Proposal"("createdAt");

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
