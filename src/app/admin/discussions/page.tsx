import { ManageDiscussionTopicsComponent } from "@/components/ManageDiscussionTopics";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Discussion Topics | MEF Admin",
  description: "Manage discussion topics and reviewer groups",
};

export default function ManageDiscussionTopicsPage() {
  return <ManageDiscussionTopicsComponent />;
} 