export const dynamic = 'force-dynamic'

import { GptSurveyProcessingView } from "@/components/admin/gpt-survey/GptSurveyProcessingView";
import { prisma } from "@/lib/prisma";
import { FundingRound } from "@prisma/client";

export const metadata = {
  title: "GPT Survey Processing - Admin Dashboard",
  description: "Process community feedback with GPT Survey",
};

// Helper function to serialize Decimal values
function serializeFundingRound(round: FundingRound) {
  return {
    ...round,
    totalBudget: round.totalBudget.toString(),
    startDate: round.startDate.toISOString(),
    endDate: round.endDate.toISOString(),
    createdAt: round.createdAt.toISOString(),
    updatedAt: round.updatedAt.toISOString(),
  };
}

export default async function GptSurveyPage() {
  const fundingRounds = await prisma.fundingRound.findMany({
    where: {
      status: {
        in: ["ACTIVE", "COMPLETED"]
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  // Serialize the funding rounds
  const serializedRounds = fundingRounds.map(serializeFundingRound);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">GPT Survey Processing</h1>
          <p className="text-muted-foreground">
            Process community feedback with GPT Survey integration
          </p>
        </div>

        <GptSurveyProcessingView fundingRounds={serializedRounds} />
      </div>
    </div>
  );
} 