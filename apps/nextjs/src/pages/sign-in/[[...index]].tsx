import { type GetServerSidePropsContext } from "next";
import { SignIn } from "@clerk/nextjs";
import { clerkClient, getAuth } from "@clerk/nextjs/server";

import { prisma } from "@acme/db";

const SignInPage = () => {
  return (
    <main className="flex h-full w-full items-center justify-center">
      <SignIn path="/sign-in" redirectUrl="/api/login" routing="virtual" />
    </main>
  );
};

export async function getServerSideProps({ req }: GetServerSidePropsContext) {
  const clerkUser = getAuth(req);

  if (clerkUser.userId) {
    const user = await clerkClient.users.getUser(clerkUser.userId);
    const primaryEmailAddress = user.emailAddresses.find(
      ({ id }) => id === user.primaryEmailAddressId,
    );

    const dbUser = await prisma.user.findFirst({
      where: {
        email: primaryEmailAddress?.emailAddress,
      },
      include: {
        Role: true,
        School: true,
      },
    });

    if (!dbUser) {
      return {};
    }

    await clerkClient.users.updateUser(user.id, {
      publicMetadata: {
        role: dbUser.Role.name,
        school: dbUser.School,
        id: dbUser.id,
      },
    });

    return {
      redirect: {
        destination: `/escola/${dbUser.School.slug}`,
        permanent: true,
      },
    };
  }

  return {};
}

export default SignInPage;
