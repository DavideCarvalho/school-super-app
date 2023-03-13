import { useEffect } from "react";
import {
  type GetServerSidePropsContext,
  type InferGetServerSidePropsType,
} from "next";
import { useRouter } from "next/router";
import { getAuth } from "@clerk/nextjs/server";
import { withServerSideAuth } from "@clerk/nextjs/ssr";

import { trpCaller } from "@acme/api";

import { SchoolFilesTable } from "~/components/table";
import { SchoolLayout } from "~/layouts/SchoolLayout";

export default function SchoolFilesPage({
  status,
  school,
  files,
  filesCount,
  limit,
  page,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  useEffect(() => {
    const routerPage = router.query.page;
    const routerLimit = router.query.limit;
    if (
      !routerPage ||
      page !== Number(routerPage) ||
      !routerLimit ||
      limit !== Number(routerLimit)
    )
      void router.replace({ query: { ...router.query, page, limit } });
  });
  return (
    <SchoolLayout>
      <SchoolFilesTable
        schoolId={school.id}
        files={files}
        filesCount={filesCount}
        page={page}
        limit={limit}
        status={
          status as "APPROVED" | "REVIEW" | "REQUESTED" | "PRINTED" | undefined
        }
      />
    </SchoolLayout>
  );
}

export const getServerSideProps = withServerSideAuth(
  async ({ req, params, query }: GetServerSidePropsContext) => {
    withServerSideAuth({ loadUser: true });
    const schoolSlug = params?.["school-slug"]! as string;
    const school = await trpCaller.school.bySlug({ slug: schoolSlug });
    if (!school) {
      // Redirect to 404 page
      throw new Error(`School with slug ${schoolSlug} not found`);
    }

    const clerkUser = getAuth(req);

    if (!clerkUser.userId) {
      // Redirect to sign in page
      return {
        redirect: {
          destination: `/sign-in?redirectTo=/${schoolSlug}/arquivos`,
          permanent: false,
        },
      };
    }

    let status = query?.["status"] as string | undefined;
    status = status ? status.toUpperCase() : undefined;
    const page = query?.["page"] ? Number(query["page"]) : 1;
    const limit = query?.["limit"] ? Number(query["limit"]) : 5;
    const filteredStatus =
      status === "REVIEW" ||
      status === "APPROVED" ||
      status === "REQUESTED" ||
      status === "PRINTED"
        ? status
        : undefined;
    const [files, filesCount] = await Promise.all([
      trpCaller.file.allBySchoolId({
        schoolId: school.id,
        orderBy: { dueDate: "asc" },
        status: filteredStatus,
        page: page,
        limit: limit,
      }),
      trpCaller.file.countAllBySchoolId({
        schoolId: school.id,
        orderBy: { dueDate: "asc" },
        status: filteredStatus,
      }),
    ]);
    return {
      props: {
        status,
        school,
        files,
        filesCount,
        page,
        limit,
      },
    };
  },
  { loadUser: true },
);
