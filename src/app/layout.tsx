import type { Metadata } from "next";
import ThemeRegistry from "@/components/shared-ui/ThemeRegistry";
import "./globals.css";

export const metadata: Metadata = {
  title: "HackPlatform - Hackathon Management",
  description:
    "Comprehensive hackathon management platform with AI-powered judging and team matching",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
