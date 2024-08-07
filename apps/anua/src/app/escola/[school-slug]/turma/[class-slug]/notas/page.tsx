import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@acme/ui/button";

import { api } from "~/trpc/server";
import { GradesTableServer } from "./containers/grades-table/grades-table.server";

export default async function ClassGradesPage({
  params,
  searchParams,
}: {
  params: { "class-slug": string; "school-slug": string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const classSlug = params["class-slug"];
  const foundClass = await api.class.findBySlug({ slug: classSlug });
  if (!foundClass) {
    return redirect("/escola");
  }
  const subjectSlug = searchParams.materia as string | null;
  const subjects =
    await api.teacher.getTeacherSubjectsOnClassForCurrentAcademicPeriod({
      classId: foundClass.id,
    });
  const foundSubject = !subjectSlug
    ? subjects[0]
    : subjects.find((s) => s.slug === subjectSlug);
  if (!foundSubject) {
    return redirect(`/escola/${params["school-slug"]}`);
  }
  return (
    <>
      <Link href="notas/adicionar-notas">
        <Button>Adicionar notas</Button>
      </Link>
      <GradesTableServer classId={foundClass.id} subjectId={foundSubject.id} />
    </>
  );
}
