import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { getAuth } from "@clerk/nextjs/server";
import { wrapGetServerSidePropsWithSentry } from "@sentry/nextjs";

import { serverSideHelpers, trpCaller } from "@acme/api";

import { SchoolFilesTable } from "~/components/school-files-table";
import { SchoolLayout } from "~/layouts/SchoolLayout";

export default function SchoolFilesPage({
  school,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <SchoolLayout>
      <SchoolFilesTable schoolId={school.id} />
    </SchoolLayout>
  );
}

export const getServerSideProps = wrapGetServerSidePropsWithSentry(
  async ({ req, params, query }: GetServerSidePropsContext) => {
    const schoolSlug = params?.["school-slug"] as string;
    const school = await trpCaller.school.bySlug({ slug: schoolSlug });
    if (!school) {
      // Redirect to 404 page
      throw new Error(`School with slug ${schoolSlug} not found`);
    }

    let status = query?.status as string | undefined;
    status = status ? status.toUpperCase() : undefined;
    const page = query?.page ? Number(query.page) : 1;
    const limit = query?.limit ? Number(query.limit) : 5;

    const clerkUser = getAuth(req);

    if (!clerkUser.userId) {
      // Redirect to sign in page
      return {
        redirect: {
          destination: `/sign-in?redirectTo=/escola/${schoolSlug}/arquivos?status=${status}&page=${page}&limit=${limit}}`,
          permanent: false,
        },
      };
    }

    const filteredStatus =
      status === "REVIEW" ||
      status === "APPROVED" ||
      status === "REQUESTED" ||
      status === "PRINTED"
        ? status
        : undefined;
    await Promise.all([
      serverSideHelpers.file.allBySchoolId.prefetch({
        schoolId: school.id,
        orderBy: { dueDate: "asc" },
        status: filteredStatus,
        page: page,
        limit: limit,
      }),
      serverSideHelpers.file.countAllBySchoolId.prefetch({
        schoolId: school.id,
        orderBy: { dueDate: "asc" },
        status: filteredStatus,
      }),
    ]);
    return {
      props: {
        school,
      },
    };
  },
  "/escola/[school-slug]/arquivos",
);
