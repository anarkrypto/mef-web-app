import { AddEditFundingRoundComponent } from "@/components/CreateEditFundingRound";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Funding Round | MEF Admin",
  description: "Create or edit funding round",
};

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ManageFundingRoundPage({ params }: PageProps) {
  const { id } = await params;
  return <AddEditFundingRoundComponent roundId={id === "new" ? null : id} />;
} 
