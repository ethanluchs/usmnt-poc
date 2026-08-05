import "./globals.css";
import AuthProvider from "../components/AuthProvider";
import { Analytics } from "@vercel/analytics/next";
import { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Wordle Cup",
  description: "Guess the World Cup 2026 player from their career stops",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Analytics />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
