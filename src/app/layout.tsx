import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata = { title: "FutureMe Mirror", description: "AI-reflection journal" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-white text-neutral-900">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
