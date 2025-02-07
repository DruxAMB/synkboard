import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ConvexClientProvider } from "@/providers/convex-client-provider";
import { ModalProvider } from "@/providers/modal-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Real-Time Whiteboard | Miron",
  description: "Real-Time Next.js 14 Miro Clone",
  keywords: ['Next.js', 'Realtime', 'Miro', 'Whiteboard', 'Draw'],
  authors: [{ name: "Eshan" }],
  robots: {
    index: false,
    follow: true,
    googleBot: {
      index: true,
      follow: false,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ConvexClientProvider>
          <Toaster theme="light" closeButton richColors />
          <ModalProvider />
          {children}
        </ConvexClientProvider>
      </body>
    </html>
  );
}
