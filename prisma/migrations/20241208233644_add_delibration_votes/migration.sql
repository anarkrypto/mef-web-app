-- CreateTable
CREATE TABLE "CommunityDeliberationVote" (
    "id" UUID NOT NULL,
    "proposalId" INTEGER NOT NULL,
    "userId" UUID NOT NULL,
    "feedback" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunityDeliberationVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewerDeliberationVote" (
    "id" UUID NOT NULL,
    "proposalId" INTEGER NOT NULL,
    "userId" UUID NOT NULL,
    "feedback" TEXT NOT NULL,
    "recommendation" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewerDeliberationVote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CommunityDeliberationVote_userId_idx" ON "CommunityDeliberationVote"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CommunityDeliberationVote_proposalId_userId_key" ON "CommunityDeliberationVote"("proposalId", "userId");

-- CreateIndex
CREATE INDEX "ReviewerDeliberationVote_userId_idx" ON "ReviewerDeliberationVote"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewerDeliberationVote_proposalId_userId_key" ON "ReviewerDeliberationVote"("proposalId", "userId");

-- AddForeignKey
ALTER TABLE "CommunityDeliberationVote" ADD CONSTRAINT "CommunityDeliberationVote_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityDeliberationVote" ADD CONSTRAINT "CommunityDeliberationVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewerDeliberationVote" ADD CONSTRAINT "ReviewerDeliberationVote_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewerDeliberationVote" ADD CONSTRAINT "ReviewerDeliberationVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
