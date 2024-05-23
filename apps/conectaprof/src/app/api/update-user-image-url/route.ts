import { clerkClient } from "@clerk/clerk-sdk-node";
import slugify from "slugify";

import { prisma } from "@acme/db";

const CONECTAPROF_API_KEY = process.env.CONECTAPROF_API_KEY;

interface Body {
  externalAuthId: string;
}

async function handler(req: Request) {
  const headers = req.headers;
  const internalApiKeyOnHeader = headers.get("X-Internal-API-Key");
  if (internalApiKeyOnHeader !== CONECTAPROF_API_KEY) {
    return new Response("Forbidden", { status: 403 });
  }
  const body: Body = await req.json();
  const clerkUser = await clerkClient.users.getUser(body.externalAuthId);
  if (!clerkUser) return;
  const userInOurDb = await prisma.user.findFirst({
    where: {
      externalAuthId: body.externalAuthId,
    },
  });
  if (!userInOurDb) return;
  if (userInOurDb.imageUrl === clerkUser.imageUrl) return;
  await prisma.user.update({
    data: {
      imageUrl: clerkUser.imageUrl,
    },
    where: {
      id: userInOurDb.id,
    },
  });
  return new Response("OK", { status: 200 });
}

export { handler as POST };

export const runtime = "nodejs";
