import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { SignIn } from "@clerk/nextjs";
import { clerkClient, getAuth } from "@clerk/nextjs/server";
import { wrapGetServerSidePropsWithSentry } from "@sentry/nextjs";

import { prisma } from "@acme/db";

export default function SignInPage({
  searchParams,
}: {
  searchParams: { redirectTo?: string };
}) {
  const redirectTo = searchParams.redirectTo ?? "/escola";
  return (
    <main className="flex h-full w-full items-center justify-center">
      <SignIn
        path="/sign-in"
        routing="path"
        fallbackRedirectUrl={redirectTo}
        appearance={{
          elements: {
            socialButtonsBlockButton__google: "hidden",
            socialButtonsBlockButton__facebook: "hidden",
            socialButtonsBlockButton__twitter: "hidden",
            socialButtonsBlockButton__line: "hidden",
            dividerRow: "hidden",
            footer: "hidden",
          },
        }}
      />
    </main>
  );
}
