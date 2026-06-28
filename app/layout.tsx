import type { Metadata } from "next";
import { PwaRuntime } from "@/components/pwa-runtime";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const defaultUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "EcomfyCalls | High-intent insurance calls",
  description:
    "Buy live, qualified insurance calls from customers ready to speak with an agent.",
  applicationName: "EcomfyCalls",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "EcomfyCalls",
  },
  formatDetection: {
    telephone: false,
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <PwaRuntime />
        </ThemeProvider>
      </body>
    </html>
  );
}
