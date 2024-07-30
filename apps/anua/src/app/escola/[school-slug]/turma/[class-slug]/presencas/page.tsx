import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@acme/ui/button";

import { api } from "~/trpc/server";
import { NewAttendanceModalListener } from "./_components/new-attendance-modal-listener";
import { StudentViewSwitch } from "./_components/student-view-switch";
import { AttendancesTableServer } from "./containers/attendances-table/attendances-table.server";
import { StudentsAttendancesTableServer } from "./containers/students-attendances-table/students-attendances-table.server";

export default async function ClassAttendancePage({
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
    <>
      <NewAttendanceModalListener
        classId={foundClass.id}
        subjectId={subject.id}
      />
      <Link
        href={`${url.pathname}?${url.searchParams.toString()}#adicionar-presenca`}
      >
        <Button>Adicionar presença</Button>
      </Link>
      <StudentViewSwitch
        afterSwitchComponent={
          <StudentsAttendancesTableServer
            classId={foundClass.id}
            subjectId={subject.id}
          />
        }
        beforeSwitchComponent={
          <AttendancesTableServer
            classId={foundClass.id}
            subjectId={subject.id}
          />
        }
      />
    </>
  );
}
