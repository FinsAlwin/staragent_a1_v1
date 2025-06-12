import { Metadata } from "next";
import AdminPanel from "./AdminPanel";

export const metadata: Metadata = {
  title: "Admin Panel - AI Resume Analyzer",
  description: "Admin panel for managing AI Resume Analyzer",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminPanel>{children}</AdminPanel>;
}
