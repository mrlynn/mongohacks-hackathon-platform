import SessionProvider from "@/components/providers/SessionProvider";
import Navbar from "@/components/shared-ui/Navbar";
import ImpersonationBanner from "@/components/shared-ui/ImpersonationBanner";
import ChatWidget from "@/components/chat/ChatWidget";
import { OnboardingProvider } from "@/contexts/OnboardingContext";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <OnboardingProvider>
        <Navbar />
        <ImpersonationBanner />
        {children}
        <ChatWidget />
      </OnboardingProvider>
    </SessionProvider>
  );
}
