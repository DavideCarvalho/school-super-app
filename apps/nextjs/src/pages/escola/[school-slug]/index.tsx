import { type GetServerSidePropsContext } from "next";
import { getAuth } from "@clerk/nextjs/server";
import { withServerSideAuth } from "@clerk/nextjs/ssr";

import { trpCaller } from "@acme/api";

import { SchoolLayout } from "~/layouts/SchoolLayout";

interface SchoolPageProps {
  school: {
    name: string;
    description: string;
  };
}

export default function SchoolPage({ school }: SchoolPageProps) {
  return <SchoolLayout></SchoolLayout>;
}

export const getServerSideProps = withServerSideAuth(
  async ({ req, params }: GetServerSidePropsContext) => {
    const schoolSlug = params?.["school-slug"]! as string;
    const school = await trpCaller.school.bySlug({ slug: schoolSlug });
    if (!school) {
      // Redirect to 404 page
      throw new Error(`School with slug ${schoolSlug} not found`);
    }

    const clerkUser = getAuth(req);

    if (!clerkUser.userId) {
      // Redirect to sign in page
      return {
        redirect: {
          destination: `/sign-in?redirectTo=/escola/${schoolSlug}`,
          permanent: false,
        },
      };
    }

    return {
      props: {},
    };
  },
  { loadUser: true },
);
