-- CreateTable
CREATE TABLE "GptSurveySummarizerProposal" (
    "id" TEXT NOT NULL,
    "proposalId" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "isSuccess" BOOLEAN NOT NULL,
    "request" JSONB NOT NULL,
    "response" JSONB NOT NULL,

    CONSTRAINT "GptSurveySummarizerProposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GptSurveySummarizerFeedback" (
    "id" TEXT NOT NULL,
    "communityDeliberationVoteId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "isSuccess" BOOLEAN NOT NULL,
    "request" JSONB NOT NULL,
    "response" JSONB NOT NULL,
    "proposalId" VARCHAR(25) NOT NULL,

    CONSTRAINT "GptSurveySummarizerFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GptSurveySummarizerProposal_proposalId_key" ON "GptSurveySummarizerProposal"("proposalId");

-- CreateIndex
CREATE UNIQUE INDEX "GptSurveySummarizerFeedback_communityDeliberationVoteId_key" ON "GptSurveySummarizerFeedback"("communityDeliberationVoteId");

-- AddForeignKey
ALTER TABLE "GptSurveySummarizerProposal" ADD CONSTRAINT "GptSurveySummarizerProposal_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GptSurveySummarizerFeedback" ADD CONSTRAINT "GptSurveySummarizerFeedback_communityDeliberationVoteId_fkey" FOREIGN KEY ("communityDeliberationVoteId") REFERENCES "CommunityDeliberationVote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GptSurveySummarizerFeedback" ADD CONSTRAINT "GptSurveySummarizerFeedback_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "GptSurveySummarizerProposal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
