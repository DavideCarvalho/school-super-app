import {
  type GetServerSidePropsContext,
  type InferGetServerSidePropsType,
} from "next";
import { getAuth } from "@clerk/nextjs/server";
import { withServerSideAuth } from "@clerk/nextjs/ssr";

import { trpCaller } from "@acme/api";

import { SchoolClassesTable } from "src/components/school-classes-table";
import { SchoolLayout } from "~/layouts/SchoolLayout";

export default function ClassesPage({
  school,
  classes,
  classesCount,
  page,
  limit,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <SchoolLayout>
      <SchoolClassesTable
        schoolId={school.id}
        classes={classes}
        classesCount={classesCount}
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

    const [classes, classesCount] = await Promise.all([
      trpCaller.class.allBySchoolId({
        schoolId: school.id,
        page,
        limit,
      }),
      trpCaller.class.countAllBySchoolId({
        schoolId: school.id,
      }),
    ]);

    return {
      props: {
        school,
        classes,
        classesCount,
        page,
        limit,
      },
    };
  },
  { loadUser: true },
);
