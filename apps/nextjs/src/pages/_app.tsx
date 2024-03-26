import "../styles/globals.css";

import type { AppType } from "next/app";
import Script from "next/script";
import { ptBR } from "@clerk/localizations";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";

import { TRPCReactProvider } from "~/trpc/react";
import { api } from "~/utils/api";

const MyApp: AppType = ({ Component, pageProps: { ...pageProps } }) => {
  return (
    <ClerkProvider localization={ptBR} {...pageProps}>
      <Script
        src="https://plausible.anuaapp.com.br/js/script.js"
        data-domain="anuaapp.com.br"
        defer
      />
      <TRPCReactProvider>
        <Component {...pageProps} />
      </TRPCReactProvider>
      <Toaster />
    </ClerkProvider>
  );
};

export default api.withTRPC(MyApp);
