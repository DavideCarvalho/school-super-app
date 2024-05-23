import { clerkClient } from "@clerk/clerk-sdk-node";
import slugify from "slugify";

import { prisma } from "@acme/db";

const CONECTAPROF_API_KEY = process.env.CONECTAPROF_API_KEY;

interface Body {
  externalAuthId: string;
  email: string;
}

async function handler(req: Request) {
  const headers = req.headers;
  const internalApiKeyOnHeader = headers.get("X-Internal-API-Key");
  if (internalApiKeyOnHeader !== CONECTAPROF_API_KEY) {
    return new Response("Forbidden", { status: 403 });
  }
  const body: Body = await req.json();
  const userInOurDb = await prisma.user.findFirst({
    where: {
      externalAuthId: body.externalAuthId,
    },
  });
  if (!userInOurDb) {
    const role = await prisma.role.findFirst({
      where: {
        name: "CONECTAPROF_USER",
      },
    });
    if (role) {
      const createdUser = await prisma.user.create({
        data: {
          name: "Novo Usuário",
          slug: slugify(`novo usuário-${body.email}-${new Date().getTime()}`),
          email: body.email,
          externalAuthId: body.externalAuthId,
          roleId: role.id,
        },
      });
      await clerkClient.users.updateUser(body.externalAuthId, {
        firstName: "Novo Usuário",
        publicMetadata: {
          id: createdUser.id,
          name: createdUser.name,
          role: role.name,
        },
      });
    }
  }
  return new Response("OK", { status: 200 });
}

export { handler as POST };

export const runtime = "nodejs";
