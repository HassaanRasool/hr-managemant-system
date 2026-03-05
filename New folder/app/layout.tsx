import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProviderClient } from "@/components/theme/theme-provider";
import { ModeToggle } from "@/components/theme/mode-toggle";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "HR Management System",
  description: "Comprehensive Human Resource Management Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Use the variable classes here to make them available to all children
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProviderClient
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative flex min-h-screen flex-col">
            {/* Placing the Toggle in a fixed or absolute container is fine, 
               but ensure it doesn't overlap important HR Dashboard navigation.
            */}
            <div className="absolute top-4 right-4 z-50">
              <ModeToggle />
            </div>

            <main className="flex-1">{children}</main>
          </div>
        </ThemeProviderClient>
      </body>
    </html>
  );
}
