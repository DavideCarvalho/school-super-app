"use client";

import { SignIn } from "@clerk/nextjs";

import { env } from "~/env";

export default function SignInPage() {
  return (
    <main className="flex h-full w-full items-center justify-center">
      <SignIn
        fallbackRedirectUrl={`${env.NEXT_PUBLIC_CONECTAPROF_URL}/feed`}
        path={`${env.NEXT_PUBLIC_ANUA_URL}/feed`}
        routing="path"
      />
    </main>
  );
}
