import type { NextPage } from "next";
import Head from "next/head";

import LandingPageBanner from "~/components/landing-page-banner";
import LandingPage, {
  Contact,
  Features,
  Footer,
  Pricing,
} from "./landing-page";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Anuá</title>
        <meta
          name="description"
          content="Gerenciar sua escola nunca foi tão fácil!"
        />
        <meta property="og:title" content="Anuá" />
        <meta
          property="og:description"
          content="Gerenciar sua escola nunca foi tão fácil!"
        />
        <meta property="og:type" content="website" />
        <meta name="og:site_name" content="Anuá" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="scroll-smooth">
        <LandingPageBanner />
        <LandingPage />
        <Features />
        <Pricing />
        <Contact />
        <Footer />
      </main>
    </>
  );
};

export default Home;
