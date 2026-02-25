import SessionProvider from "@/components/providers/SessionProvider";
import Navbar from "@/components/shared-ui/Navbar";
import ImpersonationBanner from "@/components/shared-ui/ImpersonationBanner";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <Navbar />
      <ImpersonationBanner />
      {children}
    </SessionProvider>
  );
}
