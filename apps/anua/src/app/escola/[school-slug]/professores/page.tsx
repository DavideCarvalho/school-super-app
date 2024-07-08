import { Suspense } from "react";
import { headers } from "next/headers";
import Link from "next/link";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { Button } from "@acme/ui/button";

import { api, createSSRHelper, HydrateClient } from "~/trpc/server";
import { EditTeacherModalListener } from "./_components/edit-teacher-modal-listener";
import { NewTeacherModalListener } from "./_components/new-teacher-modal-listener";
import { TeachersTableClient } from "./containers/school-teachers-table/teachers-table.client";

export default async function TeachersPage({
  params,
}: {
  params: { "school-slug": string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const requestHeaders = headers();
  const xUrl = requestHeaders.get("x-url");
  if (!xUrl) throw new Error("unreachable");
  const url = new URL(xUrl);
  if (!url.searchParams.has("page")) {
    url.searchParams.set("page", "1");
  }
  if (!url.searchParams.has("limit")) {
    url.searchParams.set("limit", "10");
  }
  const school = await api.school.bySlug({ slug: params["school-slug"] });
  if (!school) throw new Error("School not found");
  await api.teacher.getSchoolTeachers.prefetch({
    page: Number(url.searchParams.get("page")),
    limit: Number(url.searchParams.get("limit")),
  });
  await api.teacher.countSchoolTeachers.prefetch();
  return (
    <HydrateClient>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Professores</h2>
        <Link
          href={`${url.pathname}?${url.searchParams.toString()}#adicionar-professor`}
        >
          <Button>Adicionar Professor</Button>
        </Link>
      </div>
      <NewTeacherModalListener />
      <EditTeacherModalListener />
      <Suspense>
        <TeachersTableClient />
      </Suspense>
    </HydrateClient>
  );
}
