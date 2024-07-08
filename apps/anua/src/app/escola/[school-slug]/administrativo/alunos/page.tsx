import { headers } from "next/headers";
import Link from "next/link";

import { Button } from "@acme/ui/button";

import { api, HydrateClient } from "~/trpc/server";
import { NewStudentModalListener } from "./components/new-student-modal-listener";
import { StudentsTableServer } from "./containers/students-table/students-table.server";

export default async function StudentsPage({
  searchParams,
}: {
  params: { "school-slug": string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const requestHeaders = headers();
  const xUrl = requestHeaders.get("x-url");
  if (!xUrl) throw new Error("unreachable");
  const url = new URL(xUrl);
  const page = searchParams.page ? Number(searchParams.page) : 1;
  const size = searchParams.size ? Number(searchParams.size) : 10;
  api.student.allBySchoolId.prefetch({
    page,
    size,
  });
  api.student.countAllBySchoolId.prefetch();
  return (
    <HydrateClient>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Alunos</h2>
        <Link
          href={`${url.pathname}?${url.searchParams.toString()}#adicionar-aluno`}
        >
          <Button>Adicionar aluno</Button>
        </Link>
      </div>
      <NewStudentModalListener />
      <StudentsTableServer />
    </HydrateClient>
  );
}
