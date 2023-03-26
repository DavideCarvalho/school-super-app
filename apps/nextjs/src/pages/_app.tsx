import "../styles/globals.css";
import { useEffect, useState } from "react";
import type { AppType } from "next/app";
import Script from "next/script";
import { ptBR } from "@clerk/localizations";
import { ClerkProvider, useUser } from "@clerk/nextjs";
import { H } from "highlight.run";
import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
// import { AxiomReporter } from 'next-axiom';
import { Toaster } from "react-hot-toast";

import { api } from "~/utils/api";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const { user } = useUser();
  const [alreadyInitiated, setAlreadyInitiated] = useState(false);
  useEffect(() => {
    if (!user) return;
    if (alreadyInitiated) return;
    H.init(process.env.NEXT_PUBLIC_HIGHLIGHT_APP_ID, {
      tracingOrigins: true,
      networkRecording: {
        enabled: true,
        recordHeadersAndBody: true,
      },
    });
    setAlreadyInitiated(true);
  }, [user, alreadyInitiated, setAlreadyInitiated]);
  useEffect(() => {
    if (!alreadyInitiated) return;
    if (!user || !user.emailAddresses[0]?.emailAddress) return;
    H.identify(user?.emailAddresses[0]?.emailAddress);
  }, [user, alreadyInitiated]);
  return (
    <ClerkProvider localization={ptBR} {...pageProps}>
      <SessionProvider session={session}>
        <Script
          src="https://cdn.counter.dev/script.js"
          data-id="c364c5f9-523a-49bd-aa09-420f80558467"
          data-utcoffset="-3"
        />
        <Component {...pageProps} />
        {/* <AxiomReporter /> */}
      </SessionProvider>
      <Toaster />
    </ClerkProvider>
  );
};

export default api.withTRPC(MyApp);
