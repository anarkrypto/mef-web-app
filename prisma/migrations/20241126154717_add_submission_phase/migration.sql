-- CreateTable
CREATE TABLE "SubmissionPhase" (
    "id" UUID NOT NULL,
    "fundingRoundId" UUID NOT NULL,
    "startDate" TIMESTAMPTZ(6) NOT NULL,
    "endDate" TIMESTAMPTZ(6) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "SubmissionPhase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SubmissionPhase_fundingRoundId_key" ON "SubmissionPhase"("fundingRoundId");

-- CreateIndex
CREATE INDEX "SubmissionPhase_startDate_endDate_idx" ON "SubmissionPhase"("startDate", "endDate");

-- AddForeignKey
ALTER TABLE "SubmissionPhase" ADD CONSTRAINT "SubmissionPhase_fundingRoundId_fkey" FOREIGN KEY ("fundingRoundId") REFERENCES "FundingRound"("id") ON DELETE CASCADE ON UPDATE CASCADE;
