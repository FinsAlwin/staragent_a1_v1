"use client";

import { AppProvider } from "@/context/AppContext";

export default function UploadAsyncLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppProvider>{children}</AppProvider>;
}
