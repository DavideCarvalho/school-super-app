import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { getAuth } from "@clerk/nextjs/server";
import { withServerSideAuth } from "@clerk/nextjs/ssr";
import { wrapGetServerSidePropsWithSentry } from "@sentry/nextjs";

import { serverSideHelpers, trpCaller } from "@acme/api";

import { SchoolTeacherHasClassTable } from "~/components/school-teacherHasClass-table";
import { SchoolLayout } from "~/layouts/SchoolLayout";

export default function ClassesPage({
  school,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <SchoolLayout>
      <SchoolTeacherHasClassTable schoolId={school.id} />
    </SchoolLayout>
  );
}

export const getServerSideProps = wrapGetServerSidePropsWithSentry(
  withServerSideAuth(
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

      let teacherSlug = query?.teacher as string | undefined;
      teacherSlug = teacherSlug ? teacherSlug : undefined;
      let subjectSlug = query?.subject as string | undefined;
      subjectSlug = subjectSlug ? subjectSlug : undefined;
      let classSlug = query?.class as string | undefined;
      classSlug = classSlug ? classSlug : undefined;
      let classWeekDay = query?.weekday as string | undefined;
      classWeekDay = classWeekDay ? classWeekDay : undefined;

      await Promise.all([
        serverSideHelpers.teacherHasClass.allBySchoolId.prefetch({
          schoolId: school.id,
          page,
          limit,
          teacherSlug,
          subjectSlug,
          classSlug,
          classWeekDay,
        }),
        serverSideHelpers.teacherHasClass.countAllBySchoolId.prefetch({
          schoolId: school.id,
        }),
        serverSideHelpers.user.allBySchoolId.prefetch({
          schoolId: school.id,
          limit: 999,
          role: "TEACHER",
        }),
        serverSideHelpers.subject.allBySchoolId.prefetch({
          schoolId: school.id,
          limit: 999,
        }),
        serverSideHelpers.class.allBySchoolId.prefetch({
          schoolId: school.id,
          limit: 999,
        }),
      ]);

      return {
        props: {
          school,
          trpcState: serverSideHelpers.dehydrate(),
        },
      };
    },
    { loadUser: true },
  ),
  "/escola/[school-slug]/aulas",
);
