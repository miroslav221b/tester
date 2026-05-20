import { JoinSessionLayout } from "@/features/sessions/components/joinSessionLayout";

export default function JoinSessionRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <JoinSessionLayout>{children}</JoinSessionLayout>;
}
