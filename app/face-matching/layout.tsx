import AdminPanel from "../admin/AdminPanel";

export default function FaceMatchingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminPanel>{children}</AdminPanel>;
}
