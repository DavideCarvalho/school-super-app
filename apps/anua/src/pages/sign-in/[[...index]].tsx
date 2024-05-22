import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { SignIn } from "@clerk/nextjs";
import { clerkClient, getAuth } from "@clerk/nextjs/server";
import { wrapGetServerSidePropsWithSentry } from "@sentry/nextjs";

import { prisma } from "@acme/db";

const SignInPage = ({
  redirectTo,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <main className="flex h-full w-full items-center justify-center">
      <SignIn
        path="/sign-in"
        routing="path"
        afterSignInUrl={redirectTo}
        redirectUrl={redirectTo}
        fallbackRedirectUrl={redirectTo}
        appearance={{
          elements: {
            footer: "hidden",
          },
        }}
      />
    </main>
  );
};

export const getServerSideProps = wrapGetServerSidePropsWithSentry(
  async function getServerSideProps({ req, query }: GetServerSidePropsContext) {
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

      if (!dbUser || !dbUser.School) {
        return {
          props: {
            redirectTo: `sign-in?redirectTo=${redirectTo}`,
          },
        };
      }

      return {
        redirect: {
          destination: redirectTo || `/escola/${dbUser.School.slug}`,
          permanent: true,
        },
      };
    }

    return {
      props: {
        redirectTo: `sign-in?redirectTo=${redirectTo}`,
      },
    };
  },
  "/sign-in",
);

export default SignInPage;
