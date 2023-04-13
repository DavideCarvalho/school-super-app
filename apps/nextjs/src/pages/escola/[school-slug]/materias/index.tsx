import {
  type GetServerSidePropsContext,
  type InferGetServerSidePropsType,
} from "next";
import { getAuth } from "@clerk/nextjs/server";
import { withServerSideAuth } from "@clerk/nextjs/ssr";

import { trpCaller } from "@acme/api";

import { SchoolSubjectsTable } from "~/components/school-subjects-table";
import { SchoolLayout } from "~/layouts/SchoolLayout";

export default function SubjectsPage({
  school,
  subjects,
  subjectsCount,
  page,
  limit,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <SchoolLayout>
      <SchoolSubjectsTable
        schoolId={school.id}
        subjects={subjects}
        subjectsCount={subjectsCount}
        page={page}
        limit={limit}
      />
    </SchoolLayout>
  );
}

export const getServerSideProps = withServerSideAuth(
  async ({ req, params, query }: GetServerSidePropsContext) => {
    const schoolSlug = params?.["school-slug"] as string;
    const school = await trpCaller.school.bySlug({ slug: schoolSlug });
    if (!school) {
      // TODO: Redirect to 404 page
      throw new Error(`School with slug ${schoolSlug} not found`);
    }

    const page = query?.["page"] ? Number(query["page"]) : 1;
    const limit = query?.["limit"] ? Number(query["limit"]) : 5;

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

    const [subjects, subjectsCount] = await Promise.all([
      trpCaller.subject.allBySchoolId({
        schoolId: school.id,
        page,
        limit,
      }),
      trpCaller.subject.countAllBySchoolId({
        schoolId: school.id,
      }),
    ]);

    return {
      props: {
        school,
        subjects,
        subjectsCount,
        page,
        limit,
      },
    };
  },
  { loadUser: true },
);
