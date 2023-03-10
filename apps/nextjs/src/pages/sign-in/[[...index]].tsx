import {
  type GetServerSidePropsContext,
  type InferGetServerSidePropsType,
} from "next";
import { SignIn } from "@clerk/nextjs";
import { clerkClient, getAuth } from "@clerk/nextjs/server";

import { prisma } from "@acme/db";

const SignInPage = ({
  redirectTo,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  console.log(redirectTo);
  return (
    <SignIn
      path="/sign-in"
      signUpUrl="/sign-in"
      afterSignInUrl={redirectTo}
      redirectUrl={redirectTo}
    />
  );
};

export async function getServerSideProps({
  req,
  query,
}: GetServerSidePropsContext) {
  const redirectTo = (query.redirectTo as string | undefined) ?? "";

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
      return {
        props: {
          redirectTo: `api/login?redirectTo=${redirectTo}`,
        },
      };
    }

    return {
      redirect: {
        destination: redirectTo || `${dbUser.School.slug}`,
        permanent: true,
      },
    };
  }

  return {
    props: {
      redirectTo: `api/login?redirectTo=${redirectTo}`,
    },
  };
}

export default SignInPage;
