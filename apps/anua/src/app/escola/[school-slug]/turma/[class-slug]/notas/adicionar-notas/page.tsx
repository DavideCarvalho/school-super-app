import { redirect } from "next/navigation";

import { api } from "~/trpc/server";
import { AssignmentsGradesClient } from "./containers/assignments-grades/assignments-grades.client";

export default async function AddGradesPage({
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
  let subjectSlug = searchParams.materia as string | null;
  if (!subjectSlug) {
    const subjects =
      await api.teacher.getTeacherSubjectsOnClassForCurrentAcademicPeriod({
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
    <div>
      <AssignmentsGradesClient classId={foundClass.id} subjectId={subject.id} />
    </div>
  );
}
