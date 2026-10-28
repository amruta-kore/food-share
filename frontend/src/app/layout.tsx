import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthProvider";
import Navbar from "../components/Navbar";
import FloatingFeedbackButton from "../components/FloatingFeedbackButton";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FoodShare - Surplus Food Redistribution Platform",
  description: "Connect donors, NGOs, and volunteers to save surplus edible food and feed local communities.",
};

type LayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans">
        <AuthProvider>
          <Navbar />
          <div className="flex-1">
            {children}
          </div>
          <FloatingFeedbackButton />
          <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 space-y-2">
            <div className="flex items-center justify-center space-x-4 text-xs font-medium text-slate-600">
              <Link href="/" className="hover:text-emerald-700 transition">Home</Link>
              <span>•</span>
              <Link href="/feedback" className="hover:text-emerald-700 text-emerald-600 font-semibold transition flex items-center space-x-1">
                <span>⭐ Reviews & Feedback</span>
              </Link>
              <span>•</span>
              <Link href="/login" className="hover:text-emerald-700 transition">Login</Link>
              <span>•</span>
              <Link href="/register" className="hover:text-emerald-700 transition">Register</Link>
            </div>
            <p>© {new Date().getFullYear()} FoodShare Platform. Reducing Food Waste • Empowering Communities.</p>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
