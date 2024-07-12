import { redirect } from "next/navigation";
import { auth, clerkClient } from "@clerk/nextjs/server";

import { prisma } from "@acme/db";

export default async function SchoolPage() {
  const session = auth();
  if (!session?.userId) {
    redirect("/");
  }

  const userOnClerk = await clerkClient.users.getUser(session.userId);
  if (!userOnClerk) {
    return redirect("/");
  }

  const dbUser = await prisma.user.findFirst({
    where: {
      externalAuthId: userOnClerk.id,
    },
    include: {
      Role: true,
      School: true,
    },
  });

  if (!dbUser || !dbUser.School) {
    return redirect("/");
  }
  return redirect(`/escola/${dbUser.School.slug}`);
}
