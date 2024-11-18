import { AdminDashboardComponent } from "@/components/AdminDashboard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard | MEF",
  description: "Admin dashboard for managing MEF platform",
};

export default function AdminPage() {
  return <AdminDashboardComponent />;
} 