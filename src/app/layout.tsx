import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils"
import { ThemeProvider } from "next-themes";
import DarkModeToggle from "../components/ui/ui/DarkModeToggle";
import Header from "../components/ui/ui/Header";
import Loading from "./loading";


const inter = Inter({ subsets: ["latin"] });


export const metadata: Metadata = {
  title: "EzDocs",
  description: "Easiest document edit with sign feature.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-background antialiased", inter.className
        )}
      >
        <main>
          <ThemeProvider attribute="class">
          <Header /> 
        {children}
        
      </ThemeProvider>
        </main>
        
      </body>
    </html>
  );
}
