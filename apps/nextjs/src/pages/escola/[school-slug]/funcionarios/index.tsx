import type {GetServerSidePropsContext, InferGetServerSidePropsType} from "next";
import { getAuth } from "@clerk/nextjs/server";
import { withServerSideAuth } from "@clerk/nextjs/ssr";

import { serverSideHelpers, trpCaller } from "@acme/api";

import { SchoolWorkersTable } from "~/components/school-workers-table";
import { SchoolLayout } from "~/layouts/SchoolLayout";

export default function WorkersPage({
  school,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <SchoolLayout>
      <SchoolWorkersTable schoolId={school.id} />
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

    const page = query?.page ? Number(query.page) : 1;
    const limit = query?.limit ? Number(query.limit) : 5;
    const roleQuery = query?.role ? (query.role as string) : "";
    const role =
      roleQuery.toUpperCase() === "DIRECTOR" ||
      roleQuery.toUpperCase() === "TEACHER" ||
      roleQuery.toUpperCase() === "COORDINATOR" ||
      roleQuery.toUpperCase() === "SCHOOL_WORKER"
        ? (roleQuery.toUpperCase() as
            | "DIRECTOR"
            | "TEACHER"
            | "COORDINATOR"
            | "SCHOOL_WORKER")
        : undefined;

    const clerkUser = getAuth(req);

    if (!clerkUser.userId) {
      // Redirect to sign in page
      return {
        redirect: {
          destination: `/sign-in?redirectTo=/escola/${schoolSlug}/funcionarios?page=${page}&limit=${limit}&role=${role}`,
          permanent: false,
        },
      };
    }

    await Promise.all([
      serverSideHelpers.user.allBySchoolId.prefetch({
        schoolId: school.id,
        page,
        limit,
        role,
      }),
      serverSideHelpers.user.countAllBySchoolId.prefetch({
        schoolId: school.id,
        role,
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
);
