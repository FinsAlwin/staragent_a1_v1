import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - AI Resume Analyzer",
  description: "Login to access the AI Resume Analyzer",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
