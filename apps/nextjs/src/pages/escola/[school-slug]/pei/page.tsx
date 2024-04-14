import { GetServerSidePropsContext } from "next";
import { getAuth } from "@clerk/nextjs/server";
import { wrapGetServerSidePropsWithSentry } from "@sentry/nextjs";

import { serverSideHelpers, trpCaller } from "@acme/api";

export default function PEIPage() {
  return <h1>PEI</h1>;
}

export const getServerSideProps = wrapGetServerSidePropsWithSentry(
  async ({ req, params, query }: GetServerSidePropsContext) => {
    const schoolSlug = params?.["school-slug"] as string;
    const school = await trpCaller.school.bySlug({ slug: schoolSlug });
    if (!school) {
      // TODO: Redirect to 404 page
      throw new Error(`School with slug ${schoolSlug} not found`);
    }

    const page = query?.page ? Number(query.page) : 1;
    const limit = query?.limit ? Number(query.limit) : 5;

    const clerkUser = getAuth(req);

    if (!clerkUser.userId) {
      // Redirect to sign in page
      return {
        redirect: {
          destination: `/sign-in?redirectTo=/escola/${schoolSlug}/funcionarios?page=${page}&limit=${limit}`,
          permanent: false,
        },
      };
    }

    await Promise.all([
      serverSideHelpers.pei.allBySchoolId.prefetch({
        schoolId: school.id,
        page,
        limit,
      }),
      serverSideHelpers.pei.countAllBySchoolId.prefetch({
        schoolId: school.id,
      }),
    ]);

    return {
      props: {
        school,
        trpcState: serverSideHelpers.dehydrate(),
      },
    };
  },
  "/escola/[school-slug]/pei",
);
