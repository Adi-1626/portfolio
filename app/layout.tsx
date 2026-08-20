import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { resume } from "@/data/resume";
import GravityGrid from "@/components/GravityGrid";
import { ToastProvider } from "@/components/Toast";
import CommandPalette from "@/components/CommandPalette";
import SmoothScroll from "@/components/SmoothScroll";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${resume.name} — ${resume.headline}`,
  description: resume.summary,
  authors: [{ name: resume.name }],
  keywords: [
    resume.headline,
    ...Object.values(resume.skills).flat().slice(0, 10),
  ],
  openGraph: {
    title: `${resume.name} — ${resume.headline}`,
    description: resume.summary,
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: `${resume.name} — ${resume.headline}`,
    description: resume.summary,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <GravityGrid />
        <SmoothScroll />
        <ToastProvider>
          {children}
          <CommandPalette />
        </ToastProvider>
      </body>
    </html>
  );
}
