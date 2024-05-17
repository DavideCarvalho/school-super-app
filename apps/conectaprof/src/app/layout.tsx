import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";

import "./globals.css";

import Script from "next/script";

import { env } from "~/env.mjs";

export const metadata: Metadata = {
  metadataBase: new URL(
    env.NODE_ENV === "production"
      ? "https://turbo.t3.gg"
      : "http://localhost:3000",
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
          "bg-background text-foreground min-h-screen font-sans antialiased"
        }
      >
        {props.children}
        <Toaster />
      </body>
    </html>
  );
}
