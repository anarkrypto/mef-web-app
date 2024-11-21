-- CreateEnum
CREATE TYPE "FundingRoundStatus" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Proposal" ADD COLUMN     "fundingRoundId" UUID;

-- CreateTable
CREATE TABLE "Topic" (
    "id" UUID NOT NULL,
    "createdById" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewerGroup" (
    "id" UUID NOT NULL,
    "createdById" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ReviewerGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewerGroupMember" (
    "id" UUID NOT NULL,
    "reviewerGroupId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ReviewerGroupMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopicReviewerGroup" (
    "id" UUID NOT NULL,
    "topicId" UUID NOT NULL,
    "reviewerGroupId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "TopicReviewerGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FundingRound" (
    "id" UUID NOT NULL,
    "createdById" UUID NOT NULL,
    "topicId" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL,
    "status" "FundingRoundStatus" NOT NULL DEFAULT 'DRAFT',
    "startDate" TIMESTAMPTZ(6) NOT NULL,
    "endDate" TIMESTAMPTZ(6) NOT NULL,
    "totalBudget" DECIMAL(16,2) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "FundingRound_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsiderationPhase" (
    "id" UUID NOT NULL,
    "fundingRoundId" UUID NOT NULL,
    "startDate" TIMESTAMPTZ(6) NOT NULL,
    "endDate" TIMESTAMPTZ(6) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ConsiderationPhase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliberationPhase" (
    "id" UUID NOT NULL,
    "fundingRoundId" UUID NOT NULL,
    "startDate" TIMESTAMPTZ(6) NOT NULL,
    "endDate" TIMESTAMPTZ(6) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "DeliberationPhase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VotingPhase" (
    "id" UUID NOT NULL,
    "fundingRoundId" UUID NOT NULL,
    "startDate" TIMESTAMPTZ(6) NOT NULL,
    "endDate" TIMESTAMPTZ(6) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "VotingPhase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Topic_createdById_idx" ON "Topic"("createdById");

-- CreateIndex
CREATE INDEX "ReviewerGroup_createdById_idx" ON "ReviewerGroup"("createdById");

-- CreateIndex
CREATE INDEX "ReviewerGroupMember_userId_idx" ON "ReviewerGroupMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewerGroupMember_reviewerGroupId_userId_key" ON "ReviewerGroupMember"("reviewerGroupId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "TopicReviewerGroup_topicId_reviewerGroupId_key" ON "TopicReviewerGroup"("topicId", "reviewerGroupId");

-- CreateIndex
CREATE INDEX "FundingRound_createdById_idx" ON "FundingRound"("createdById");

-- CreateIndex
CREATE INDEX "FundingRound_status_idx" ON "FundingRound"("status");

-- CreateIndex
CREATE INDEX "FundingRound_startDate_endDate_idx" ON "FundingRound"("startDate", "endDate");

-- CreateIndex
CREATE UNIQUE INDEX "ConsiderationPhase_fundingRoundId_key" ON "ConsiderationPhase"("fundingRoundId");

-- CreateIndex
CREATE INDEX "ConsiderationPhase_startDate_endDate_idx" ON "ConsiderationPhase"("startDate", "endDate");

-- CreateIndex
CREATE UNIQUE INDEX "DeliberationPhase_fundingRoundId_key" ON "DeliberationPhase"("fundingRoundId");

-- CreateIndex
CREATE INDEX "DeliberationPhase_startDate_endDate_idx" ON "DeliberationPhase"("startDate", "endDate");

-- CreateIndex
CREATE UNIQUE INDEX "VotingPhase_fundingRoundId_key" ON "VotingPhase"("fundingRoundId");

-- CreateIndex
CREATE INDEX "VotingPhase_startDate_endDate_idx" ON "VotingPhase"("startDate", "endDate");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_userId_key" ON "AdminUser"("userId");

-- CreateIndex
CREATE INDEX "Proposal_fundingRoundId_idx" ON "Proposal"("fundingRoundId");

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_fundingRoundId_fkey" FOREIGN KEY ("fundingRoundId") REFERENCES "FundingRound"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewerGroup" ADD CONSTRAINT "ReviewerGroup_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewerGroupMember" ADD CONSTRAINT "ReviewerGroupMember_reviewerGroupId_fkey" FOREIGN KEY ("reviewerGroupId") REFERENCES "ReviewerGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewerGroupMember" ADD CONSTRAINT "ReviewerGroupMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicReviewerGroup" ADD CONSTRAINT "TopicReviewerGroup_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicReviewerGroup" ADD CONSTRAINT "TopicReviewerGroup_reviewerGroupId_fkey" FOREIGN KEY ("reviewerGroupId") REFERENCES "ReviewerGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundingRound" ADD CONSTRAINT "FundingRound_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundingRound" ADD CONSTRAINT "FundingRound_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsiderationPhase" ADD CONSTRAINT "ConsiderationPhase_fundingRoundId_fkey" FOREIGN KEY ("fundingRoundId") REFERENCES "FundingRound"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliberationPhase" ADD CONSTRAINT "DeliberationPhase_fundingRoundId_fkey" FOREIGN KEY ("fundingRoundId") REFERENCES "FundingRound"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VotingPhase" ADD CONSTRAINT "VotingPhase_fundingRoundId_fkey" FOREIGN KEY ("fundingRoundId") REFERENCES "FundingRound"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminUser" ADD CONSTRAINT "AdminUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
