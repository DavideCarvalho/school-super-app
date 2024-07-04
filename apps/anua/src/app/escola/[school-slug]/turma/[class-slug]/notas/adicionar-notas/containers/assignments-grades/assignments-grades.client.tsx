"use client";

import { api } from "~/trpc/react";

interface AssignmentsGradesClientProps {
  classId: string;
}

export function AssignmentsGradesClient({
  classId,
}: AssignmentsGradesClientProps) {
  const { data: assignments } =
    api.assignment.getStudentsAssignmentsGradesForClassOnCurrentAcademicPeriod.useQuery(
      {
        classId: classId,
      },
    );
  console.log("assignments", assignments);
  return <div>AssignmentsGradesClient</div>;
}
