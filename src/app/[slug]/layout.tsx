import LandingPageFooter from "@/components/landing-pages/LandingPageFooter";

export default function LandingPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <LandingPageFooter />
    </>
  );
}
