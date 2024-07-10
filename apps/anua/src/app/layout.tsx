import { ptBR } from "@clerk/localizations";
import { ClerkProvider } from "@clerk/nextjs";

import { ToasterPortal } from "./toaster-portal";

import "../styles/globals.css";

import { TRPCReactProvider } from "~/trpc/react";

export const metadata = {
  title: "Anuá",
  description: "Seu sistema de gestão escolar",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ToasterPortal />
        <ClerkProvider localization={ptBR} signInUrl="/sign-in">
          <TRPCReactProvider>{children}</TRPCReactProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
