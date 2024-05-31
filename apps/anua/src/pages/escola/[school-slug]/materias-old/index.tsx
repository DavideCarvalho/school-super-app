import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { getAuth } from "@clerk/nextjs/server";
import { wrapGetServerSidePropsWithSentry } from "@sentry/nextjs";

import { serverSideHelpers, trpCaller } from "@acme/api";

import { SchoolSubjectsTable } from "~/components/school-subjects-table";
import { SchoolLayout } from "~/layouts/SchoolLayout";

export default function SubjectsPage({
  school,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <SchoolLayout>
      <SchoolSubjectsTable schoolId={school.id} />
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
          destination: `/sign-in?redirectTo=/escola/${schoolSlug}/materias?page=${page}&limit=${limit}`,
          permanent: false,
        },
      };
    }

    await Promise.all([
      serverSideHelpers.subject.allBySchoolId.prefetch({
        page,
        limit,
      }),
      serverSideHelpers.subject.countAllBySchoolId.prefetch(),
    ]);

    return {
      props: {
        school,
        trpcState: serverSideHelpers.dehydrate(),
      },
    };
  },
  "/escola/[school-slug]/materias",
);
