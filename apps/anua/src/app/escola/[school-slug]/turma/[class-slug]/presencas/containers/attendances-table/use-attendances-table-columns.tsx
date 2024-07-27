import { createColumnHelper } from "@tanstack/react-table";

import type { RouterOutputs } from "@acme/api";

type Row =
  RouterOutputs["attendance"]["getClassAttendanceForCurrentAcademicPeriod"][0];

export function useAttendancesTableColumns() {
  const columnHelper = createColumnHelper<Row>();

  return [
    columnHelper.accessor("Student.User.name", {
      id: "name",
      header: "Aluno",
    }),
    columnHelper.accessor("totalAttendanceNumber", {
      id: "attendedClasses",
      header: "Presença",
    }),
    columnHelper.accessor((row) => `${row.totalAttendancePercentage}%`, {
      id: "attendancePercentage",
      header: "Percentual de presença",
    }),
    columnHelper.display({
      id: "attendancePerTeacherHasClass",
      header: "Presença por professor",
      cell: ({ row }) => {
        return (
          <div>
            {row.original.attendancePerTeacherHasClass.map((attendance) => (
              <div key={attendance.TeacherHasClass.id}>
                <p>{attendance.TeacherHasClass.Subject.name}</p>
                <p>{attendance.attendancePercentage}%</p>
              </div>
            ))}
          </div>
        );
      },
    }),
  ];
}
