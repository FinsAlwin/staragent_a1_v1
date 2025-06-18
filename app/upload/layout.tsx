import { Metadata } from "next";
import AdminPanel from "../admin/AdminPanel";

export const metadata: Metadata = {
  title: "Upload Resume - AI Resume Analyzer",
  description: "Upload and analyze your resume with AI-powered insights",
};

export default function UploadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminPanel>{children}</AdminPanel>;
}
