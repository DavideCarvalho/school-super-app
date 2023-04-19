import {
  type GetServerSidePropsContext,
  type InferGetServerSidePropsType,
} from "next";
import { getAuth } from "@clerk/nextjs/server";
import { withServerSideAuth } from "@clerk/nextjs/ssr";

import { trpCaller } from "@acme/api";

import { SchoolTeacherHasClassTable } from "~/components/school-teacherHasClass-table";
import { SchoolLayout } from "~/layouts/SchoolLayout";

export default function ClassesPage({
  teacherHasClasses,
  teacherHasClassesCount,
  teachers,
  subjects,
  classes,
  page,
  limit,
  school,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <SchoolLayout>
      <SchoolTeacherHasClassTable
        schoolId={school.id}
        teachers={teachers}
        subjects={subjects}
        classes={classes}
        teacherHasClasses={teacherHasClasses}
        teacherHasClassesCount={teacherHasClassesCount}
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
          destination: `/sign-in?redirectTo=/escola/${schoolSlug}/anos?page=${page}&limit=${limit}`,
          permanent: false,
        },
      };
    }

    const [
      teacherHasClasses,
      teacherHasClassesCount,
      teachers,
      subjects,
      classes,
    ] = await Promise.all([
      trpCaller.teacherHasClass.allBySchoolId({
        schoolId: school.id,
        page,
        limit,
      }),
      trpCaller.teacherHasClass.countAllBySchoolId({
        schoolId: school.id,
      }),
      trpCaller.user.allBySchoolId({
        schoolId: school.id,
        limit: 999,
        role: "TEACHER",
      }),
      trpCaller.subject.allBySchoolId({
        schoolId: school.id,
        limit: 999,
      }),
      trpCaller.class.allBySchoolId({
        schoolId: school.id,
        limit: 999,
      }),
    ]);

    return {
      props: {
        school,
        teacherHasClasses,
        teacherHasClassesCount,
        teachers,
        subjects,
        classes,
        page,
        limit,
      },
    };
  },
  { loadUser: true },
);
