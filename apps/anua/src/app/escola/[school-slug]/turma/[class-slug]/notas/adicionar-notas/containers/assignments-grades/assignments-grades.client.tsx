"use client";

import { api } from "~/trpc/react";

interface AssignmentsGradesClientProps {
  classId: string;
}

export function AssignmentsGradesClient({
  classId,
}: AssignmentsGradesClientProps) {
  const { data: assignments } =
    api.assignment.getCurrentAcademicPeriodAssignments.useQuery({
      classId: classId,
    });
  const { data: studentsGrades } =
    api.assignment.getStudentsAssignmentsGradesForClassOnCurrentAcademicPeriod.useQuery(
      {
        classId: classId,
      },
    );
  console.log("studentsGrades", studentsGrades);
  return <div>AssignmentsGradesClient</div>;
}
