import { type NextApiRequest, type NextApiResponse } from "next";
import { clerkClient, getAuth } from "@clerk/nextjs/server";

import { prisma } from "@acme/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(501).end();
  }
  const { userId } = getAuth(req);

  if (!userId) {
    return res.redirect(307, "/sign-in");
  }

  const user = await clerkClient.users.getUser(userId);

  const primaryEmailAddress = user.emailAddresses.find(
    ({ id }) => id === user.primaryEmailAddressId,
  );

  if (!primaryEmailAddress) {
    return res.redirect(307, "/sign-in");
  }

  const dbUser = await prisma.user.findFirst({
    where: {
      email: primaryEmailAddress.emailAddress,
    },
    include: {
      Role: true,
      School: true,
    },
  });

  if (!dbUser) {
    return res.redirect(307, "/sign-in");
  }

  await clerkClient.users.updateUser(userId, {
    publicMetadata: {
      role: dbUser.Role.name,
      school: dbUser.School,
      id: dbUser.id,
    },
  });

  console.log("req.query", req.query);

  const redirectTo = req.query.redirectTo as string | undefined;

  const redirectUrl = redirectTo ?? `/${dbUser.School.slug}`;

  console.log("redirectUrl", redirectUrl);

  return res.redirect(307, redirectUrl);
}
