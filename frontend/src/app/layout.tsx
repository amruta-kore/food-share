import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "AnnaSetu - Surplus Food Redistribution Platform",
  description: "Connect donors, NGOs, and volunteers to save surplus edible food and feed local communities.",
};

type LayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans">
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
