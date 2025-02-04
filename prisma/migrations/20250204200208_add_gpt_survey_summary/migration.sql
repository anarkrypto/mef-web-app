-- DropForeignKey
ALTER TABLE "GptSurveySummarizerFeedback" DROP CONSTRAINT "GptSurveySummarizerFeedback_proposalId_fkey";

-- AlterTable
ALTER TABLE "GptSurveySummarizerFeedback" ALTER COLUMN "proposalId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "GptSurveySummarizerProposal" ADD COLUMN     "summary" TEXT,
ADD COLUMN     "summary_updated_at" TIMESTAMPTZ(6);

-- AddForeignKey
ALTER TABLE "GptSurveySummarizerFeedback" ADD CONSTRAINT "GptSurveySummarizerFeedback_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "GptSurveySummarizerProposal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
