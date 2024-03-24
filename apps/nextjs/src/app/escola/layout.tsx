import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";

import { TRPCReactProvider } from "~/trpc/react";

import "~/styles/globals.css";

export default async function Layout(props: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="pt-BR" suppressHydrationWarning>
        <body>
          <TRPCReactProvider>
            <Toaster />
            {props.children}
          </TRPCReactProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
