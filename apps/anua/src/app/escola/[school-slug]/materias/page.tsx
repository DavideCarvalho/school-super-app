import { Suspense } from "react";
import { headers } from "next/headers";
import Link from "next/link";

import { Button } from "@acme/ui/button";

import { EditSubjectModalListener } from "./_components/edit-subject-modal-listener";
import { NewSubjectModalListener } from "./_components/new-subject-modal-listener";
import { SubjectsTableServer } from "./containers/school-subjects-table/subjects-table.server";

export default async function SubjectsPage({
  params,
}: {
  params: { "school-slug": string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const requestHeaders = headers();
  const xUrl = requestHeaders.get("x-url")!;
  const url = new URL(xUrl);
  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Matérias</h2>
        <Link
          href={`${url.pathname}?${url.searchParams.toString()}#adicionar-materia`}
        >
          <Button>Adicionar Matéria</Button>
        </Link>
      </div>

      <NewSubjectModalListener />
      <EditSubjectModalListener />
      <SubjectsTableServer />
    </>
  );
}
