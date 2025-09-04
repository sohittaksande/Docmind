
import { Inter } from "next/font/google";
import "./globals.css";
import { cn, constructMetadata } from "../lib/utils";
import Navbar from "../components/Navbar";
import Providers from "../components/Providers";
import "react-loading-skeleton/dist/skeleton.css";
import { Toaster } from "@/components/ui/sonner";
import "simplebar-react/dist/simplebar.min.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = constructMetadata()

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <body
        className={cn("min-h-screen font-sans antialiased grainy", inter.className)}
      >
        <Providers>
          <Toaster />
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
