import "../styles/globals.css";
import type { AppType } from "next/app";
import Script from "next/script";
import { ptBR } from "@clerk/localizations";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/react";
// import { AxiomReporter } from 'next-axiom';
import { Toaster } from "react-hot-toast";

import { api } from "~/utils/api";
import { env } from "~/env.mjs";

const MyApp: AppType = ({ Component, pageProps: { ...pageProps } }) => {
  console.log("env", env);
  console.log(
    "env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
    env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  );
  // const { user } = useUser();

  // const [alreadyInitiated, setAlreadyInitiated] = useState(false);
  // useEffect(() => {
  //   if (!user) return;
  //   if (alreadyInitiated) return;
  //   H.init(process.env.NEXT_PUBLIC_HIGHLIGHT_APP_ID, {
  //     tracingOrigins: true,
  //     networkRecording: {
  //       enabled: true,
  //       recordHeadersAndBody: true,
  //     },
  //   });
  //   setAlreadyInitiated(true);
  // }, [user, alreadyInitiated, setAlreadyInitiated]);
  // useEffect(() => {
  //   if (!alreadyInitiated) return;
  //   if (!user || !user.emailAddresses[0]?.emailAddress) return;
  //   H.identify(user?.emailAddresses[0]?.emailAddress);
  // }, [user, alreadyInitiated]);
  return (
    <ClerkProvider localization={ptBR} {...pageProps}>
      <Script
        src="https://cdn.counter.dev/script.js"
        data-id="c364c5f9-523a-49bd-aa09-420f80558467"
        data-utcoffset="-3"
      />
      <Script
        src="https://plausible.anuaapp.com.br/js/script.js"
        data-domain="anuaapp.com.br"
        defer={true}
      />
      <Component {...pageProps} />
      <Analytics />
      {/* <AxiomReporter /> */}
      <Toaster />
    </ClerkProvider>
  );
};

export default api.withTRPC(MyApp);
