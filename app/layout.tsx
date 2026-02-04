import type { Metadata } from "next";
import { IBM_Plex_Sans, Poetsen_One } from "next/font/google";

import { ClerkProvider } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

import "./globals.css";

const IBMPlex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-plex"
});

const poetsenone = Poetsen_One({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-poetsenone"
});

export const metadata: Metadata = {
  title: "AI: Where Images Evolve",
  description: "ImaginAI: Where Images Evolve | Image Restoration, Recoloring, Object Removal and Background Removal using AI tools",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={{
      variables: { colorPrimary: "#361d78" }
    }}>
      <html lang="en">
        <body className={cn("font-IBMPlex antialiased", poetsenone.variable, IBMPlex.variable)}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}