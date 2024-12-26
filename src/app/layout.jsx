
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils"
import { ThemeProvider } from "next-themes";
import DarkModeToggle from "../components/ui/ui/Navbar";
import Header from "../components/ui/ui/Header";
import Loading from "./loading";
import Provider from  "../lib/Provider"


const inter = Inter({ subsets: ["latin"] });


export const metadata = {
  title: "EzDocs",
  description: "Easiest document edit with sign feature.",
};

export default function RootLayout({
  children,
}) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-background antialiased", inter.className
        )}
      >
        <Provider > 
               
          <main>
            <ThemeProvider attribute="class">
            <Header /> 
            {children}
          </ThemeProvider>
          </main>
        </Provider>
      </body>
    </html>
  );
}
