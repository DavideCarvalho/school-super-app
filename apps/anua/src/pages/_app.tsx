import "../styles/globals.css";

import type { AppType } from "next/app";
import Script from "next/script";
import { ptBR } from "@clerk/localizations";
import { ClerkProvider } from "@clerk/nextjs";
import { GoogleTagManager } from "@next/third-parties/google";
import { Toaster } from "react-hot-toast";

import { api, TRPCReactProvider } from "~/trpc/react";

const MyApp: AppType = ({ Component, pageProps: { ...pageProps } }) => {
  return (
    <ClerkProvider
      localization={ptBR}
      {...pageProps}
      appearance={{
        elements: {
          footer: "hidden",
        },
      }}
    >
      <Script
        src="https://plausible.anuaapp.com.br/js/script.js"
        data-domain="anuaapp.com.br"
        defer
      />
      <Script id="clarity-script" strategy="afterInteractive">
        {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID}");
          `}
      </Script>
      <TRPCReactProvider>
        <Component {...pageProps} />
        <GoogleTagManager gtmId="G-7ND9Y9SETT" />
      </TRPCReactProvider>
      <Toaster />
    </ClerkProvider>
  );
};

export default MyApp;
