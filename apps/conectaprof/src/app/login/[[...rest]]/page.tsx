"use client";

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="flex h-full w-full items-center justify-center">
      <SignIn
        fallbackRedirectUrl={"/feed"}
        path={"/login"}
        signUpUrl={"/criar-conta"}
        routing="path"
      />
    </main>
  );
}
