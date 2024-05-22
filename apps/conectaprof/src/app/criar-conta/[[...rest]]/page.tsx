"use client";

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="flex h-full w-full items-center justify-center">
      <SignUp
        fallbackRedirectUrl={"/api/signed-up-user"}
        path={"/criar-conta"}
        routing="path"
      />
    </main>
  );
}
