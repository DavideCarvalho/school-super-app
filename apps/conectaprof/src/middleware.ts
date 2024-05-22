import { clerkClient } from "@clerk/clerk-sdk-node";
import { clerkMiddleware } from "@clerk/nextjs/server";

import { env } from "./env";

const CONECTAPROF_URL =
  env.NODE_ENV === "development"
    ? "http://localhost:3001"
    : env.NEXT_PUBLIC_CONECTAPROF_URL;

export default clerkMiddleware(async (auth) => {
  const maybeSignedInUser = auth();
  if (maybeSignedInUser?.userId) {
    const signedInUser = await clerkClient.users.getUser(
      maybeSignedInUser.userId,
    );
    if (!signedInUser) {
      return;
    }
    if (
      !signedInUser.publicMetadata ||
      Object.keys(signedInUser.publicMetadata).length === 0
    ) {
      const userEmail = signedInUser.emailAddresses[0]?.emailAddress;
      await fetch(`${CONECTAPROF_URL}/api/signed-up-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Internal-API-Key": env.CONECTAPROF_API_KEY,
        },
        body: JSON.stringify({
          email: userEmail,
          externalAuthId: maybeSignedInUser.userId,
        }),
      });
    }
  }
});

// Stop Middleware running on static files
export const config = {
  matcher: [
    /*
     * Match request paths except for the ones starting with:
     * - _next
     * - static (static files)
     * - favicon.ico (favicon file)
     *
     * This includes images, and requests from TRPC.
     */
    "/(.*?trpc.*?|(?!static|.*\\..*|_next|favicon.ico).*)",
  ],
};
