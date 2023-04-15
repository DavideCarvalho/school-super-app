import {
  type GetServerSidePropsContext,
  type InferGetServerSidePropsType,
} from "next";
import { getAuth } from "@clerk/nextjs/server";
import { withServerSideAuth } from "@clerk/nextjs/ssr";

import { trpCaller } from "@acme/api";

import { SchoolTeachersTable } from "~/components/school-teachers-table";
import { SchoolLayout } from "~/layouts/SchoolLayout";

export default function TeachersPage({
  school,
  teachers,
  teachersCount,
  page,
  limit,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <SchoolLayout>
      <SchoolTeachersTable
        schoolId={school.id}
        teachers={teachers}
        teachersCount={teachersCount}
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
          destination: `/sign-in?redirectTo=/escola/${schoolSlug}/funcionarios?page=${page}&limit=${limit}`,
          permanent: false,
        },
      };
    }

    const teachers = await trpCaller.user.allBySchoolId({
      schoolId: school.id,
      page,
      limit,
      role: "TEACHER",
    });

    const teachersCount = await trpCaller.user.countAllBySchoolId({
      schoolId: school.id,
      role: "TEACHER",
    });

    return {
      props: {
        school,
        teachers,
        teachersCount,
        page,
        limit,
      },
    };
  },
  { loadUser: true },
);
