-- CreateEnum
CREATE TYPE "WorkerStatus" AS ENUM ('RUNNING', 'COMPLETED', 'FAILED', 'NOT_STARTED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "oCVConsiderationVoteId" INTEGER;

-- CreateTable
CREATE TABLE "OCVConsiderationVote" (
    "id" SERIAL NOT NULL,
    "proposalId" INTEGER NOT NULL,
    "voteData" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OCVConsiderationVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkerHeartbeat" (
    "jobId" TEXT NOT NULL,
    "lastHeartbeat" TIMESTAMP(3) NOT NULL,
    "status" "WorkerStatus" NOT NULL DEFAULT 'RUNNING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkerHeartbeat_pkey" PRIMARY KEY ("jobId")
);

-- CreateIndex
CREATE UNIQUE INDEX "OCVConsiderationVote_proposalId_key" ON "OCVConsiderationVote"("proposalId");

-- CreateIndex
CREATE INDEX "OCVConsiderationVote_proposalId_idx" ON "OCVConsiderationVote"("proposalId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_oCVConsiderationVoteId_fkey" FOREIGN KEY ("oCVConsiderationVoteId") REFERENCES "OCVConsiderationVote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OCVConsiderationVote" ADD CONSTRAINT "OCVConsiderationVote_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
