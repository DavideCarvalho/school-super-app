import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";

import { TRPCReactProvider } from "~/trpc/react";

import "./globals.css";

import Script from "next/script";

import { env } from "~/env";

export const metadata: Metadata = {
  metadataBase: new URL(
    env.NODE_ENV === "production"
      ? env.NEXT_PUBLIC_CONECTAPROF_URL
      : "http://localhost:3001",
  ),
  title: "ConectaProf",
  description: "Rede social para professores",
  openGraph: {
    title: "ConectaProf",
    description: "Rede social para professores",
    url: "https://create-t3-turbo.vercel.app",
    siteName: "Create T3 Turbo",
  },
  twitter: {
    card: "summary_large_image",
    site: "@jullerino",
    creator: "@jullerino",
  },
};

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <Script
        src="https://plausible.anuaapp.com.br/js/script.js"
        data-domain="conectaprof.anuaapp.com.br"
        defer
      />
      <body
        className={
          "min-h-screen bg-background font-sans text-foreground antialiased"
        }
      >
        <ClerkProvider>
          <TRPCReactProvider>
            {props.children}
            <Toaster />
          </TRPCReactProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
