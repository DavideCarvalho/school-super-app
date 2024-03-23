import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { getAuth } from "@clerk/nextjs/server";
import { withServerSideAuth } from "@clerk/nextjs/ssr";
import { wrapGetServerSidePropsWithSentry } from "@sentry/nextjs";

import { serverSideHelpers, trpCaller } from "@acme/api";

import { SchoolClassesTable } from "~/components/school-classes-table";
import { SchoolLayout } from "~/layouts/SchoolLayout";

export default function ClassesPage({
  school,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <SchoolLayout>
      <SchoolClassesTable schoolId={school.id} />
    </SchoolLayout>
  );
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
          destination: `/sign-in?redirectTo=/escola/${schoolSlug}/anos?page=${page}&limit=${limit}`,
          permanent: false,
        },
      };
    }

    await Promise.all([
      serverSideHelpers.class.allBySchoolId.prefetch({
        schoolId: school.id,
        page,
        limit,
      }),
      serverSideHelpers.class.countAllBySchoolId.prefetch({
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
  "/escola/[school-slug]/turmas",
);
