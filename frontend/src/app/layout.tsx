import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./globals.css";
import { AuthProvider } from "./context/AuthProvider";
import { LanguageProvider } from "./context/LanguageProvider";
import Navbar from "../components/Navbar";
import FloatingFeedbackButton from "../components/FloatingFeedbackButton";
import Footer from "../components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AnnaSetu | Surplus Food Redistribution Platform",
  description: "Connect verified donors, NGOs, and volunteers to save surplus edible food with real-time OTP tracking and FSSAI safety compliance.",
};

type LayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--background)] text-neutral-900 font-sans antialiased selection:bg-emerald-100 selection:text-emerald-900">
        <LanguageProvider>
          <AuthProvider>
            <Navbar />
            <div className="flex-1">
              {children}
            </div>
            <FloatingFeedbackButton />
            <Footer />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
