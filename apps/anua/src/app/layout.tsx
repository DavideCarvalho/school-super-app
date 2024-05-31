import { ptBR } from "@clerk/localizations";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";

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
        <Toaster position="top-center" />
        <div>
          <ClerkProvider localization={ptBR}>
            <TRPCReactProvider>{children}</TRPCReactProvider>
          </ClerkProvider>
        </div>
      </body>
    </html>
  );
}
