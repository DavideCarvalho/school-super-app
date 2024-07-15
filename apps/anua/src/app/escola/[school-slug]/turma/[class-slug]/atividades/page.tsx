import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@acme/ui/button";

import { api } from "~/trpc/server";
import { NewAssignmentModalListener } from "./_components/new-assignment-modal-listener";
import { AssignmentsTableServer } from "./containers/assignments-table/assignments-table.server";

export default async function ClassActivityPage({
  params,
  searchParams,
}: {
  params: { "class-slug": string; "school-slug": string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const requestHeaders = headers();
  const xUrl = requestHeaders.get("x-url");
  if (!xUrl) throw new Error("unreachable");
  const url = new URL(xUrl);
  const classSlug = params["class-slug"];
  const foundClass = await api.class.findBySlug({ slug: classSlug });
  if (!foundClass) {
    return redirect("/escola");
  }
  let subjectSlug = searchParams.materia as string | null;
  if (!subjectSlug) {
    const subjects =
      await api.academicPeriod.getSubjectsOnClassForCurrentAcademicPeriod({
        classId: foundClass.id,
      });
    if (!subjects || subjects.length === 0) {
      return redirect("/escola");
    }
    const firstSubject = subjects[0];
    if (!firstSubject) return redirect("/escola");
    subjectSlug = firstSubject.slug;
  }
  const subject = await api.subject.findBySlug({ slug: subjectSlug });
  if (!subject) {
    return redirect("/escola");
  }
  return (
    <>
      <NewAssignmentModalListener classId={foundClass.id} />
      <Link
        href={`${url.pathname}?${url.searchParams.toString()}#adicionar-atividade`}
      >
        <Button>Adicionar atividade</Button>
      </Link>
      <AssignmentsTableServer classId={foundClass.id} subjectId={subject.id} />
    </>
  );
}
